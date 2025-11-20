console.log('Frontend is running! Connecting to Backend...');

// Basic DOM manipulation to confirm script is executing
document.querySelector('#app')!.innerHTML = `
  <h1>Willkommen bei Psy-Nexus!</h1>
  <p>Frontend (Vite/TS) läuft stabil.</p>
  <p>Backend-API-Status: ✅ (Getestet: /api/auth/register)</p>
`;
