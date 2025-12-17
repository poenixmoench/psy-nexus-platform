const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/psy-nexus';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB Connected to:', mongoUri);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    console.error('Retry in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};

module.exports = connectDB;
