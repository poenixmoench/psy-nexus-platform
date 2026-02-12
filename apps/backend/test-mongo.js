const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB-Verbindung erfolgreich!');
        
        // Testdatenbank erstellen/verwenden
        const db = client.db('nexus-test');
        
        // Test-Aggregation
        const stats = await db.admin().serverStatus();
        console.log('📊 MongoDB Stats:', {
            connections: stats.connections,
            memory: stats.mem,
            uptime: stats.uptime
        });
        
        // Test-Agenten-Sammlung
        const agents = db.collection('agent_profiles');
        const testData = {
            agent_id: 'test-agent-001',
            status: 'online',
            created_at: new Date(),
            metrics: { queries: 0, inserts: 0 }
        };
        
        await agents.insertOne(testData);
        console.log('✅ Test-Agent erfolgreich angelegt');
        
        // Verbindung schließen
        await client.close();
        console.log('🔒 MongoDB-Verbindung geschlossen');
        
    } catch (error) {
        console.error('❌ MongoDB-Verbindung fehlgeschlagen:', error);
        process.exit(1);
    }
}

testConnection();
