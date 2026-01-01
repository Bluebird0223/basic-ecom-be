const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/node-backend';
    const DB_NAME = process.env.DB_NAME || 'node-backend';

    const conn = await mongoose.connect(mongoURI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add buffering options for serverless
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    });

    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    // Do NOT exit process in serverless environment
    // process.exit(1); 
    throw error;
  }
};

module.exports = { connectDatabase };
