const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  sender: { type: String, required: true }, // 'user' oder Agent ID
  receiver: { type: String, required: true }, // Agent ID oder 'system'
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'code', 'task', 'response', 'error'], default: 'text' },
  status: { type: String, enum: ['pending', 'processing', 'complete', 'failed'], default: 'pending' },
  codeLanguage: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
