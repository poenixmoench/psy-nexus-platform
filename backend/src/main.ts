import express from 'express';
import path from 'path';
import { connectDB } from './db/connection';
import { setupUserTable } from './db/userQueries';
import { setupEventTable } from './db/eventQueries';
import { authRoutes } from './routes/authRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { healthRoutes } from './routes/health';

const app = express();

async function initializeApp() {
    console.log('🚀 Initializing application...');
    await connectDB();
    console.log('📋 Setting up database tables...');
    await setupUserTable();
    await setupEventTable();
    console.log('✅ Database setup complete.');
}

initializeApp().then(() => {
    app.use(express.json());
    
    // ✅ Static files aus /app/public
    const publicPath = path.join(__dirname, '..', 'public');
    console.log(`📂 Serving static files from: ${publicPath}`);
    app.use(express.static(publicPath));
    
    // API Routes
    app.use('/auth', authRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/health', healthRoutes);
    
    // ✅ Fallback für React Router
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });

    app.listen(3000, () => {
        console.log('✨ Backend server running on port 3000');
        console.log('🌐 Frontend served from /app/public');
    });
}).catch(err => {
    console.error('❌ Failed to initialize:', err);
    process.exit(1);
});
