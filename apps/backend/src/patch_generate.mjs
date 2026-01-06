import fs from 'fs'

let code = fs.readFileSync('index.ts', 'utf8')

// Finde response.data.on('data' und füge logging hinzu
const oldDataHandler = `response.data.on('data', (chunk: Buffer) => {
      try {
        const lines = chunk.toString().split('\\n').filter(l => l.trim());`

const newDataHandler = `response.data.on('data', (chunk: Buffer) => {
      try {
        console.log('📦 Ollama response chunk received, length:', chunk.length)
        const lines = chunk.toString().split('\\n').filter(l => l.trim());
        console.log('📨 Parsed', lines.length, 'lines from chunk')`

if (!code.includes(oldDataHandler)) {
  console.error('Handler nicht gefunden - andere Formatierung?')
  process.exit(1)
}

code = code.replace(oldDataHandler, newDataHandler)

// Füge auch logging vor try block hinzu
const oldTry = `try {
    const prompt = \`Du bist \${agentName}\`

const newTry = `try {
    console.log('🚀 generateWithStreaming started for:', agentName, 'message:', userMessage.substring(0, 50))
    const prompt = \`Du bist \${agentName}\``

code = code.replace(oldTry, newTry)

fs.writeFileSync('index.ts', code)
console.log('✅ Debug logging hinzugefügt')

