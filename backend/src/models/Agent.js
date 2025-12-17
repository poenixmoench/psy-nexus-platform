const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // orion, nexus-prime, etc.
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['idle', 'busy', 'error'], default: 'idle' },
  description: String,
  capabilities: [String],
  color: String, // Für UI (z.B. #32CD32)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', AgentSchema);
