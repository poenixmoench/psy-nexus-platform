import express from 'express';
import { connectDB } from './db/connection'; // BENANNTER IMPORT
import { authRoutes } from './routes/authRoutes'; // BENANNTER IMPORT (korrigiert für default export)

const app = express();
connectDB();

app.use(express.json());
// ... weitere Middleware ...

app.use('/auth', authRoutes); // Verwenden des importierten Routers

const PORT = process.env.PORT || 3000;

// FIX TS2769: explizite Konvertierung zu Zahl
app.listen(Number(PORT), () => {
    console.log(`Server is running on port ${PORT}`);
});
