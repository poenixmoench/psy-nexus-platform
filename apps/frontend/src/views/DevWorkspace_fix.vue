// In the <script setup> section, ADD:

onMounted(async () => {
  console.log('🔄 DevWorkspace mounted - loading agents...')
  
  // Lade Agenten direkt via REST API als Fallback
  try {
    const response = await fetch('/api/agents')
    const data = await response.json()
    console.log('✅ Agenten geladen via REST:', Object.keys(data.agents || {}))
    agents.value = data.agents || {}
  } catch (err) {
    console.error('❌ Fehler beim Laden der Agenten:', err)
  }
})
