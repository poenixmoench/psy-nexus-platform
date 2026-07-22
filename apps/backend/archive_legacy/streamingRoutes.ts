import express from 'express';
import { streamingChatController } from '../controllers/streamingChatController';

const router = express.Router();

// Route für den eigentlichen Orchestrierungs-Endpunkt
router.post('/orchestrate', streamingChatController.startChat);

// Health Check Route (von früher)
router.get('/health', streamingChatController.healthCheck);

export default router;
