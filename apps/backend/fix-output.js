const fs = require('fs');
const path = './src/agents';
const files = fs.readdirSync(path).filter(f => f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(`${path}/${file}`, 'utf8');
  
  // Wenn fullOutput nicht befüllt wird, fügen wir es an das onToken-Event an
  if (!content.includes('fullOutput +=')) {
    content = content.replace(/onToken\(token\);?/g, 'onToken(token); fullOutput += token;');
    // Syntax-Reparatur für Arrow-Functions ohne Klammern
    content = content.replace(/\(token\)\s*=>\s*onToken\(token\);\s*fullOutput\s*\+=\s*token;/g, '(token) => { onToken(token); fullOutput += token; }');
    fs.writeFileSync(`${path}/${file}`, content);
  }
}
