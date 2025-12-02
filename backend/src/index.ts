import express from 'express';
import { connectDB } from './db/connection';
import { setupUserTable } from './db/userQueries';
import { setupEventTable } from './db/eventQueries';
import { authRoutes } from './routes/authRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { healthRoutes } from './routes/health';

const app = express();

async function initializeApp() {
    console.log('🚀 Initializing application...');
    
    // WICHTIG: Warte auf die DB-Verbindung und Tabellenerstellung
    await connectDB();
    
    console.log('📋 Setting up database tables...');
    await setupUserTable();
    await setupEventTable();
    console.log('✅ Database setup complete.');
}

// Führe die Initialisierung aus und starte den Server NUR bei Erfolg
initializeApp().then(() => {
    app.use(express.json());
    // ... weitere Middleware ...

    // Setze /api/ als Präfix für Events, um Konsistenz mit Frontend-Fix zu gewährleisten
    app.use('/auth', authRoutes);
    app.use('/api/events', eventRoutes); 
    app.use('/api/health', healthRoutes); // Besser, wenn /api/ verwendet wird

    const PORT = process.env.PORT || 3000;
    app.listen(Number(PORT), () => {
        console.log(`✨ Backend server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('❌ Failed to start server after initialization:', err);
    process.exit(1); // Beende den Prozess, wenn die DB-Verbindung fehlschlägt
});

export { app };
