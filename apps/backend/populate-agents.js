const { MongoClient } = require('mongodb');

async function populateAgents() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB-Verbindung erfolgreich!');
        
        const db = client.db('nexus-test');
        const agents = db.collection('agent_profiles');
        
        // 8 Agentenprofile wie im Audit
        const agentProfiles = [
            { agent_id: 'PLAN-AGENT', status: 'active', role: 'planning', created_at: new Date() },
            { agent_id: 'FRONTEND-MEISTER', status: 'active', role: 'frontend', created_at: new Date() },
            { agent_id: 'DESIGN-ALCHEMIST', status: 'active', role: 'design', created_at: new Date() },
            { agent_id: 'BACKEND-ARCHITEKT', status: 'active', role: 'backend', created_at: new Date() },
            { agent_id: 'QA-GURU', status: 'active', role: 'testing', created_at: new Date() },
            { agent_id: 'OPTIMIERER', status: 'active', role: 'optimization', created_at: new Date() },
            { agent_id: 'DOKUMENTATION-AGENT', status: 'active', role: 'documentation', created_at: new Date() },
            { agent_id: 'ETHICS-AUDITOR', status: 'active', role: 'ethics', created_at: new Date() }
        ];
        
        // Einfügen der Agenten
        const result = await agents.insertMany(agentProfiles);
        console.log(`✅ ${result.insertedCount} Agenten erfolgreich angelegt`);
        
        // Anzahl der Dokumente zählen
        const count = await agents.countDocuments({});
        console.log(`📊 Gesamtanzahl Agenten in DB: ${count}`);
        
        await client.close();
        console.log('🔒 MongoDB-Verbindung geschlossen');
        
    } catch (error) {
        console.error('❌ Fehler beim Befüllen der Agenten:', error);
        process.exit(1);
    }
}

populateAgents();
