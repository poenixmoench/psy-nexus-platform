const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. ALLE kaputten Streaming-Versuche entfernen
  content = content.replace(/await this\.aiService\.askAIStream[^;]+;/g, '');
  content = content.replace(/let fullOutput[^;]+;/g, '');
  content = content.replace(/fullOutput\s*\+\=/g, '');
  
  // 2. SAUBERE Streaming-Logik EINFÜGEN
  const insertPoint = content.indexOf('Processing');
  if (insertPoint !== -1) {
    const cleanLog = 'console.log(`🚀 [${this.constructor.name}] Processing...`);\n';
    const streamingCode = `let fullOutput = "";
    await this.aiService.askAIStream(query, (token) => {
      if (typeof payload !== 'undefined' && payload.onToken) {
        payload.onToken(token);
      }
      fullOutput += token;
    }, this.name);
    
    const before = content.substring(0, insertPoint + 'Processing'.length);
    const after = content.substring(insertPoint + 'Processing'.length);
    content = before + '\n' + cleanLog + streamingCode + '\n' + after;
  }
  
  // 3. Return fixen (letzter return im File)
  if (content.includes('output: fullOutput')) {
    content = content.replace(/return\s*{[^}]*output:\s*fullOutput[^}]*}/, 
      `return { success: true, output: fullOutput, agentName: this.name, newTags: [] };`
    );
  }
  
  fs.writeFileSync(file, content);
  console.log(`✅ ${file} gefixt`);
}

console.log('🎉 ALLE AGENTEN WIEDER STREAMING-BEREIT');
