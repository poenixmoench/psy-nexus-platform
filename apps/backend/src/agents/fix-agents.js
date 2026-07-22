const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Alten kaputten Log-Müll sicher entfernen
  content = content.replace(/console\.log\([^)]*Processing\.\.\.[^)]*\);\n?/g, '');
  content = content.replace(/let fullOutput\s*=\s*".*";\n?/g, '');
  
  // 2. Sauber neu aufbauen
  if (content.includes('await this.aiService.askAIStream')) {
    content = content.replace(
      'await this.aiService.askAIStream',
      'console.log(`🚀 [${this.constructor.name}] Processing...`);\n    let fullOutput = "";\n    await this.aiService.askAIStream'
    );
    fs.writeFileSync(file, content);
  }
}
console.log("✅ TypeScript-Dateien repariert!");
