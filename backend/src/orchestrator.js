const Agent = require('./models/Agent');
const Message = require('./models/Message');
const Session = require('./models/Session');

// Agenten-Response Simulation
const simulateAgentResponse = (agentId, userTask) => {
  let response = {
    content: `[${agentId.toUpperCase()}] verarbeitet: "${userTask}"`,
    type: 'response',
    code: null,
    previewCode: null
  };

  switch (agentId) {
    case 'nexus-prime':
      response.content += ' API-Route definiert. [OK]';
      response.code = `// NEXUS-PRIME Generated API\nrouter.get('/api/data', (req, res) => {\n  res.json({ status: 'ok' });\n});`;
      break;
    case 'aura':
      response.content += ' Design-Token generiert. [OK]';
      response.code = `:root {\n  --accent: #FFD700;\n  --primary: #32CD32;\n}`;
      break;
    case 'syntax':
      response.content += ' Vue Component erstellt. [OK]';
      response.code = `<template>\n  <div class="component">\n    {{ message }}\n  </div>\n</template>\n<script setup>\nconst message = 'Hello World';\n</script>`;
      break;
    case 'validus':
      response.content = '[VALIDUS] Code Review: PASS. Keine Fehler gefunden. [OK]';
      response.type = 'info';
      break;
    case 'mirror':
      response.content = '[MIRROR] Live Preview aktualisiert. [OK]';
      break;
    case 'infra':
      response.content += ' Config aktualisiert. [OK]';
      response.code = `# Infrastructure Config\ndocker-compose restart backend`;
      break;
    default:
      response.content = 'Aufgabe empfangen.';
  }

  // HTML Preview
  response.previewCode = `
    <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        body {
          background: #000;
          color: #32CD32;
          font-family: 'Ubuntu Mono', monospace;
          padding: 20px;
          margin: 0;
        }
        h2 { color: #00FFFF; margin: 0 0 15px 0; }
        .content { margin-bottom: 20px; }
        .code { background: rgba(50,205,50,0.15); padding: 15px; border-left: 4px solid #FFD700; white-space: pre-wrap; overflow-x: auto; font-size: 12px; }
      </style>
    </head>
    <body>
      <h2>[SUCCESS] ${agentId.toUpperCase()}</h2>
      <div class="content">${response.content.replace(/\[\w+\]/g, '')}</div>
      ${response.code ? '<div class="code">' + response.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>' : ''}
    </body>
    </html>
  `;

  return response;
};

// Hauptfunktion
const handleIncomingMessage = async (data, ws) => {
  const { type, sender, content, targetAgent } = data;

  if (type !== 'user_message') return;

  // 1. ORION Bestätigung
  ws.send(JSON.stringify({
    type: 'system',
    sender: 'orion',
    content: `ORION: Beauftrage ${targetAgent.toUpperCase()}... [RUN]`
  }));

  // 2. Verarbeitungszeit simulieren
  await new Promise(resolve => setTimeout(resolve, 1200));

  // 3. Agent-Response generieren
  const agentResponse = simulateAgentResponse(targetAgent, content);

  // 4. Agent-Antwort senden
  ws.send(JSON.stringify({
    type: agentResponse.type,
    sender: targetAgent,
    content: agentResponse.content,
    code: agentResponse.code,
    preview: agentResponse.previewCode
  }));

  // 5. ORION Abschluss
  await new Promise(resolve => setTimeout(resolve, 800));
  ws.send(JSON.stringify({
    type: 'system',
    sender: 'orion',
    content: 'ORION: Ergebnis verarbeitet. Bereit für nächste Aufgabe. [USER_INPUT]'
  }));
};

module.exports = { handleIncomingMessage };
