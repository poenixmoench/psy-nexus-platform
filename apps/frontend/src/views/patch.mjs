import fs from 'fs'

try {
  let code = fs.readFileSync('DevWorkspace.vue', 'utf8')

  const oldOnMounted = `onMounted(async () => {
  // Make variables global for console debugging
  window.socket = socket
  window.activeAgent = activeAgent
  window.agents = agents
  window.userInput = userInput
  window.send = send
  console.log('🔌 Socket gemacht global:', socket)
  console.log('🔄 DevWorkspace mounted - loading agents...')`

  const newOnMounted = `onMounted(async () => {
  // Make variables global for console debugging
  window.socket = socket
  window.activeAgent = activeAgent
  window.agents = agents
  window.userInput = userInput
  window.livePreview = livePreview
  window.previewFrame = previewFrame
  window.send = send
  console.log('🔌 Socket gemacht global:', socket)
  console.log('🔄 DevWorkspace mounted - loading agents...')`

  if (!code.includes(oldOnMounted)) {
    console.error('❌ onMounted Block nicht gefunden')
    process.exit(1)
  }

  code = code.replace(oldOnMounted, newOnMounted)
  fs.writeFileSync('DevWorkspace.vue', code)
  console.log('✅ previewFrame + livePreview zu globals hinzugefügt')
  
} catch (err) {
  console.error('❌ Fehler:', err.message)
  process.exit(1)
}
