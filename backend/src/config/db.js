const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Support both MONGODB_URI and MONGO_URI
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI not defined in environment variables');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('⚠️ MongoDB connection error:', error.message);
    console.log('⚠️ App will continue without database. Add your IP to MongoDB Atlas whitelist.');
    console.log('📝 Visit: https://cloud.mongodb.com/v2 > Network Access > Add IP Address');
    // Don't exit - allow app to run without database
  }
};

module.exports = connectDB;