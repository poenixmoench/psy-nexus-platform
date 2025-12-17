const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  apiToken: { type: String, unique: true },
  role: { type: String, enum: ['user', 'admin', 'developer'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  preferences: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'de' },
    defaultAgent: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
