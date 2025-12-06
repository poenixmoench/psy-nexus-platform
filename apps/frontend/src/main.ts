import { createApp } from 'vue'

createApp({
  template: `
    <div style="background: #1e1e1e; color: #39FF14; font-family: 'Ubuntu Mono', monospace; min-height: 100vh; padding: 2rem;">
      <header style="display: flex; justify-content: space-between; border-bottom: 1px solid #39FF14; padding-bottom: 1rem; margin-bottom: 2rem;">
        <h1 style="font-size: 2.5rem; margin: 0;">🚀 AGENT DEV STUDIO</h1>
        <span style="background: rgba(57,255,20,0.1); padding: 0.5rem 1rem; border: 1px solid #39FF14; border-radius: 4px;">STATUS: LIVE</span>
      </header>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div>
          <h2 style="color: #39FF14;">🟢 Backend API</h2>
          <a href="http://157.180.31.27:3000/health" target="_blank" style="color: #39FF14; text-decoration: none;">/health → Test</a>
        </div>
        <div>
          <button onclick="testAPI()" style="background: #39FF14; color: black; padding: 1rem 2rem; border: none; font-size: 1.1rem; cursor: pointer; border-radius: 4px;">
            🧪 API TEST → Orchestrierung
          </button>
        </div>
      </div>
      <script>
        async function testAPI() {
          try {
            const res = await fetch('http://157.180.31.27:3000/api/orchestrate', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({prompt: 'Vue Agent Card', socketId: 'browser-123'})
            });
            const data = await res.json();
            console.log('🟢 Backend Response:', data);
            alert('✅ API LIVE: ' + data.message);
          } catch (e) {
            console.error('Backend Error:', e);
            alert('❌ Backend nicht erreichbar');
          }
        }
      </script>
    </div>
  `
}).mount('#app')
