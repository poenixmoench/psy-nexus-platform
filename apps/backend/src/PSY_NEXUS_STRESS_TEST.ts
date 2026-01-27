import io from 'socket.io-client';
import * as fs from 'fs';

const SOCKET_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 60000;
const REPORT_FILE = 'stress-test-report.json';

interface TestCase {
  id: string;
  agent: string;
  prompt: string;
  expectedKeywords: string[];
  forbiddenPatterns: string[];
  description: string;
}

interface TestResult {
  testId: string;
  agent: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'TIMEOUT';
  startTime: number;
  endTime: number;
  duration: number;
  tokenCount: number;
  htmlValid: boolean;
  tailwindViolations: string[];
  responseLength: number;
  errors: string[];
  notes: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TEST_1_QA_GURU_LARGE_TABLE',
    agent: 'QA-GURU',
    prompt: `Erstelle einen Test-Report mit Tabelle: 15 Browser (Chrome, Firefox, Safari, Edge), je 5 Tests. Mix PASS/FAIL/WARN. 75 Zeilen. Responsive: overflow-x-auto, w-full, text-xs. Nutze HTML + Tailwind CDN!`,
    expectedKeywords: ['overflow-x-auto', 'w-full', 'bg-green-600', 'bg-red-600', 'bg-yellow-600', 'text-xs', 'table'],
    forbiddenPatterns: ['width: 50%', 'width: 800px', 'max-width: 400px', 'style="width', '<style>'],
    description: '🔴 QA-GURU Large Table Test - 75 rows'
  },
  {
    id: 'TEST_2_FRONTEND_NESTED_LAYOUT',
    agent: 'FRONTEND-MEISTER',
    prompt: `Dashboard: 3 Spalten Desktop, 1 Spalte Mobile (400px). Cards mit Header, 3 Sub-Items, Footer. gap-3, px-3 py-2, gradient bg. text-xs/text-sm. KEIN <style>! 400px→1 col, 1024px→3 cols responsive!`,
    expectedKeywords: ['flex-col', 'md:flex-row', 'gap-3', 'w-full', 'max-w-full', 'text-xs', 'text-sm', 'px-3', 'py-2'],
    forbiddenPatterns: ['<style>', 'width: 50%', 'position: fixed', 'overflow: hidden', 'max-width: 400px', 'style="'],
    description: '🟡 FRONTEND-MEISTER Nested Flexbox - 3→1 responsive'
  },
  {
    id: 'TEST_3_PLAN_AGENT_COMPLEX_GANTT',
    agent: 'PLAN-AGENT',
    prompt: `10-Phasen Timeline: Planning, Design, Dev-Frontend, Dev-Backend, Integration, QA, Performance, Security, Deployment, Monitoring. Name, Start, Duration, Progress %. Vertikal, blaue Dots, grüne Bars. 400px fit ohne horizontal scroll! truncate wenn zu lang!`,
    expectedKeywords: ['flex-col', 'gap-2', 'w-full', 'truncate', 'rounded-full', 'bg-blue', 'px-3', 'text-xs', 'max-w-full'],
    forbiddenPatterns: ['width: 50%', '<style>', 'overflow-x', 'max-width: 600px', 'position: absolute'],
    description: '🟢 PLAN-AGENT Complex Gantt - 10 phases'
  }
];

class TailwindValidator {
  static checkHTMLValidity(html: string): { valid: boolean; error?: string } {
    try {
      if (!html.includes('<html') || !html.includes('</html>')) {
        return { valid: false, error: 'Missing html tags' };
      }
      if (!html.includes('<body') || !html.includes('</body>')) {
        return { valid: false, error: 'Missing body tags' };
      }
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  }

  static extractCodeBlock(text: string): string {
    const fencedMatch = text.match(/```html\s+([\s\S]*?)```/i);
    if (fencedMatch) return fencedMatch[1].trim();
    const genericMatch = text.match(/```\s*([\s\S]*?)```/);
    if (genericMatch && genericMatch[1].includes('<html')) {
      return genericMatch[1].trim();
    }
    const htmlStart = Math.max(text.indexOf('<!DOCTYPE'), text.indexOf('<html'));
    if (htmlStart !== -1) {
      let html = text.substring(htmlStart).trim();
      const endPos = html.lastIndexOf('</html>');
      if (endPos !== -1) html = html.substring(0, endPos + 7);
      if (!html.includes('</html>')) html += '\n</html>';
      return html;
    }
    return '';
  }

  static findTailwindViolations(html: string, forbiddenPatterns: string[]): string[] {
    const violations: string[] = [];
    for (const pattern of forbiddenPatterns) {
      if (html.includes(pattern)) {
        violations.push(`Found: "${pattern}"`);
      }
    }
    const styleMatches = html.match(/style="([^"]+)"/g);
    if (styleMatches) {
      styleMatches.forEach(match => {
        violations.push(`Inline style: ${match}`);
      });
    }
    if (html.includes('<style>')) {
      violations.push('Forbidden <style> tag detected');
    }
    return violations;
  }

  static validateTailwindClasses(html: string, expectedKeywords: string[]): { found: string[]; missing: string[] } {
    const found: string[] = [];
    const missing: string[] = [];
    for (const keyword of expectedKeywords) {
      if (html.includes(keyword)) {
        found.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
    return { found, missing };
  }
}

class StressTestRunner {
  private socket: any;
  private results: TestResult[] = [];

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to PSY-NEXUS');
        resolve();
      });

      this.socket.on('connect_error', (err: any) => {
        reject(err);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }

  async runTest(testCase: TestCase): Promise<TestResult> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 ${testCase.description}`);
    console.log(`${'='.repeat(80)}`);

    const result: TestResult = {
      testId: testCase.id,
      agent: testCase.agent,
      status: 'FAIL',
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      tokenCount: 0,
      htmlValid: false,
      tailwindViolations: [],
      responseLength: 0,
      errors: [],
      notes: ''
    };

    let fullResponse = '';
    let agentDoneReceived = false;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        result.status = 'TIMEOUT';
        result.errors.push('Test exceeded 60s timeout');
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        console.log(`\n⏱️  TIMEOUT after ${result.duration}ms`);
        resolve(result);
      }, TEST_TIMEOUT);

      this.socket.on('agent-chunk', (data: any) => {
        if (data.agent === testCase.agent) {
          fullResponse += data.chunk || '';
          result.responseLength = fullResponse.length;
          result.tokenCount = Math.ceil(fullResponse.length / 4);
          process.stdout.write('.');
        }
      });

      this.socket.on('agent-done', () => {
        if (!agentDoneReceived) {
          agentDoneReceived = true;
          clearTimeout(timeout);

          result.endTime = Date.now();
          result.duration = result.endTime - result.startTime;

          console.log(`\n\n📊 Response: ${result.responseLength} chars (${result.tokenCount} tokens est.)`);
          console.log(`⏱️  Duration: ${result.duration}ms | Speed: ${(result.tokenCount / (result.duration/1000)).toFixed(1)} tokens/sec\n`);

          const html = TailwindValidator.extractCodeBlock(fullResponse);

          if (!html) {
            result.errors.push('No HTML code block found');
            result.status = 'FAIL';
            console.log(`❌ No HTML code block found`);
          } else {
            console.log(`✅ HTML extracted (${html.length} chars)`);

            const htmlValidation = TailwindValidator.checkHTMLValidity(html);
            result.htmlValid = htmlValidation.valid;
            if (!htmlValidation.valid) {
              result.errors.push(`HTML invalid: ${htmlValidation.error}`);
              console.log(`❌ HTML Invalid: ${htmlValidation.error}`);
            } else {
              console.log(`✅ HTML structure valid`);
            }

            result.tailwindViolations = TailwindValidator.findTailwindViolations(html, testCase.forbiddenPatterns);

            if (result.tailwindViolations.length > 0) {
              result.status = 'FAIL';
              console.log(`❌ Tailwind Violations:`);
              result.tailwindViolations.forEach(v => console.log(`   • ${v}`));
            } else {
              console.log(`✅ No Tailwind violations`);
            }

            const tailwindCheck = TailwindValidator.validateTailwindClasses(html, testCase.expectedKeywords);

            if (tailwindCheck.missing.length > 0) {
              result.status = 'PARTIAL';
              result.notes = `Missing: ${tailwindCheck.missing.join(', ')}`;
              console.log(`⚠️  Missing keywords: ${tailwindCheck.missing.join(', ')}`);
            } else {
              console.log(`✅ All expected keywords found (${tailwindCheck.found.length})`);
            }

            if (result.htmlValid && result.tailwindViolations.length === 0) {
              result.status = 'PASS';
            }
          }

          console.log(`\n🎯 Result: ${result.status}\n`);
          this.results.push(result);
          resolve(result);
        }
      });

      console.log(`📤 Sending to ${testCase.agent}...\n`);
      this.socket.emit('user-message', {
        agent: testCase.agent,
        message: testCase.prompt
      });
    });
  }

  async runAllTests(): Promise<void> {
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`# 🚀 PSY-NEXUS 2.0 AGENT STRESS TEST SUITE`);
    console.log(`# ${new Date().toISOString()}`);
    console.log(`${'#'.repeat(80)}\n`);

    for (const testCase of TEST_CASES) {
      await this.runTest(testCase);
      await this.delay(2000);
    }

    this.generateReport();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateReport(): void {
    console.log(`\n\n${'#'.repeat(80)}`);
    console.log(`# 📋 FINAL TEST REPORT`);
    console.log(`${'#'.repeat(80)}\n`);

    let passCount = 0;
    let failCount = 0;
    let partialCount = 0;
    let timeoutCount = 0;

    this.results.forEach((result, idx) => {
      const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : result.status === 'FAIL' ? '❌' : '⏱️';
      console.log(`${idx + 1}. ${statusEmoji} ${result.testId}`);
      console.log(`   Agent: ${result.agent}`);
      console.log(`   Duration: ${result.duration}ms | Response: ${result.responseLength} chars`);
      console.log(`   HTML Valid: ${result.htmlValid} | Violations: ${result.tailwindViolations.length}`);

      if (result.errors.length > 0) {
        console.log(`   ❌ Errors: ${result.errors.join('; ')}`);
      }

      if (result.notes) {
        console.log(`   ⚠️  Notes: ${result.notes}`);
      }

      console.log();

      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else if (result.status === 'PARTIAL') partialCount++;
      else if (result.status === 'TIMEOUT') timeoutCount++;
    });

    console.log(`${'='.repeat(80)}`);
    console.log(`📊 FINAL SCORE:`);
    console.log(`   ✅ PASS: ${passCount}/${TEST_CASES.length}`);
    console.log(`   ⚠️  PARTIAL: ${partialCount}/${TEST_CASES.length}`);
    console.log(`   ❌ FAIL: ${failCount}/${TEST_CASES.length}`);
    console.log(`   ⏱️  TIMEOUT: ${timeoutCount}/${TEST_CASES.length}`);
    console.log(`${'='.repeat(80)}\n`);

    fs.writeFileSync(REPORT_FILE, JSON.stringify(this.results, null, 2));
    console.log(`📁 Full JSON report saved to: ${REPORT_FILE}\n`);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}

async function main() {
  const runner = new StressTestRunner();

  try {
    await runner.connect();
    await runner.runAllTests();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    runner.disconnect();
    process.exit(0);
  }
}

main();
