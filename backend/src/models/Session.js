const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, default: 'Untitled Session' },
  description: String,
  activeAgent: String, // Agent ID
  status: { type: String, enum: ['active', 'paused', 'archived'], default: 'active' },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  generatedCode: String,
  codeLanguage: { type: String, default: 'javascript' },
  preview: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
