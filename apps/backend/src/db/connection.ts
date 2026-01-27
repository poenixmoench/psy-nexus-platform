import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/psy-nexus';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB successfully.');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

export const getDatabase = () => mongoose.connection.db;
