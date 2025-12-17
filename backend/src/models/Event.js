const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  category: { type: String, enum: ['tech', 'community', 'design', 'workshop', 'other'], default: 'community' },
  image: String,
  isPublic: { type: Boolean, default: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxAttendees: Number,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
