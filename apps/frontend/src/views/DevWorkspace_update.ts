onMounted(async () => {
  console.log('🔄 DevWorkspace mounted - loading agents...')

  // 1️⃣ Lade Agenten SOFORT via REST API
  try {
    const response = await fetch('https://api.psy-nexus.live/agents')
    const data = await response.json()
    console.log('✅ Agenten geladen via REST:', Object.keys(data.agents || {}))
    agents.value = data.agents || {}
  } catch (err) {
    console.error('❌ REST Fehler:', err)
  }

  // 2️⃣ WebSocket Listener für Updates
  socket.on('init-agents', (data) => {
    console.log('✅ Agenten via WebSocket:', Object.keys(data.agents || {}))
    agents.value = data.agents || {}
  })

  socket.on('connect', () => {
    console.log('🔌 WebSocket verbunden!')
  })

  socket.on('disconnect', () => {
    console.log('🔌 WebSocket getrennt!')
  })

  socket.on('agent-partial', (data) => {
    if (data.agent === activeAgent.value) {
      streamingAgent.value = data.agent
      targetText.value = data.partial
      if (!typewriterInterval) {
        typewriterInterval = setInterval(() => {
          if (streamingText.value.length < targetText.value.length) {
            streamingText.value += targetText.value.charAt(streamingText.value.length)
          }
        }, 20)
      }
    }
  })

  socket.on('state-update', (data) => {
    agents.value = data.agents || {}
  })
})
