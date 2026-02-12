"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = void 0;
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/psy-nexus';
async function connectDB() {
    try {
        await mongoose_1.default.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB successfully.');
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}
const getDatabase = () => mongoose_1.default.connection.db;
exports.getDatabase = getDatabase;
