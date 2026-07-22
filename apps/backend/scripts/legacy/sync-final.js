const { MongoClient } = require('mongodb');
async function sync() {
    const client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    const db = client.db('nexus-test');
    
    const mapping = [
        { file: 'OrionAgent', role: 'Strategische Leitung' },
        { file: 'PlanAgent', role: 'Projekt Koordination' },
        { file: 'DesignAlchemistAgent', role: 'Visuelle Gestaltung' },
        { file: 'FrontendMeisterAgent', role: 'UI/UX Architektur' },
        { file: 'BackendArchitectAgent', role: 'System Infrastruktur' },
        { file: 'QaGuruAgent', role: 'Qualitätssicherung' },
        { file: 'OptimizerAgent', role: 'Performance Tuning' },
        { file: 'DokumentationAgent', role: 'Technische Dokumentation' }
    ];

    const profiles = mapping.map(m => ({
        agent_id: m.file.replace('Agent', '').toUpperCase() + '-AGENT',
        className: m.file,
        role: m.role,
        status: 'active',
        path: `./src/agents/${m.file}.ts`
    }));

    await db.collection('agent_profiles').insertMany(profiles);
    console.log('✅ Mission erfüllt: 8 Agenten mit Code-Referenz synchronisiert!');
    await client.close();
}
sync();
