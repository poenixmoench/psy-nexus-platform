const fs = require('fs');
const path = '.';
const files = fs.readdirSync(path).filter(f => f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. SAUBERE STREAMING-LOGIK WIEDERHERSTELLEN
  const streamingPattern = /await this\.aiService\.askAIStream\s*\([^,]+,\s*\(\s*token\s*\)\s*=>\s*{([^}]+)}\s*,/;
  if (streamingPattern.test(content)) {
    content = content.replace(
      streamingPattern,
      `await this.aiService.askAIStream(query, (token) => {
        if (payload.onToken) payload.onToken(token);
        fullOutput += token;
      }, this.name);`
    );
  } else {
    // Fallback: Einfache Version einfügen
    content = content.replace(
      /await this\.aiService\.askAIStream[^;]+;/,
      `let fullOutput = "";
      await this.aiService.askAIStream(query, (token) => {
        if (payload.onToken) payload.onToken(token);
        fullOutput += token;
      }, this.name);`
    );
  }
  
  // 2. Return-Statements fixen
  content = content.replace(
    /output:\s*fullOutput,/g,
    'output: fullOutput,'
  );
  
  fs.writeFileSync(file, content);
}
console.log('✅ AGENTEN STREAMING WIEDERHERGESTELLT');
