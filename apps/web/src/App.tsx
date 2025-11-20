import React, { useState } from 'react';
import './index.css';

function App() {
    const [message, setMessage] = useState('Verbinde mit API...');
    const [apiStatus, setApiStatus] = useState('Lade...');

    // Health Check vom Backend abrufen
    const checkHealth = async () => {
        try {
            // Nutzt den Nginx-Proxy-Pass zur /api/ Route
            const res = await fetch('/api/');
            const data = await res.text();
            setApiStatus(res.ok ? '✅ API Erreichbar' : `❌ Fehler (${res.status})`);
            setMessage(data);
        } catch (error) {
            setApiStatus('❌ API-Verbindungsfehler');
            setMessage('Der Backend-Service ist nicht erreichbar.');
        }
    };

    React.useEffect(() => {
        checkHealth();
    }, []);

    return (
        <div className="App">
            <h1>🚀 Psy-Nexus Frontend</h1>
            <p>Status: {apiStatus}</p>
            <p>Backend-Nachricht: <strong>{message}</strong></p>
            <button onClick={checkHealth}>API Health Check</button>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
                Development Complete: Backend läuft stabil. Fokus jetzt auf Frontend-Integration.
            </p>
        </div>
    );
}

export default App;
