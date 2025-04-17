const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Choose DB based on USE_CLOUD_DB flag
    const dbURI = process.env.USE_CLOUD_DB === "true" ? process.env.CLOUD_MONGO_URI : process.env.MONGO_URI;

    if (!dbURI) {
      console.error('MongoDB URI is missing! Check your .env file.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);


    console.log(`✅ MongoDB connected: ${dbURI.includes("mongodb+srv") ? "Cloud" : "Local"}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
