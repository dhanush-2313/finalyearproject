require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const logger = require('./utils/logger');
const { getContract } = require('./blockchain/gateway');
const monitoring = require('./utils/monitoring');
const blockchainEvents = require('./utils/blockchainEvents');
const User = require('./models/User');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const refugeeRoutes = require('./routes/refugeeRoutes');
const donorRoutes = require('./routes/donorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const fieldWorkerRoutes = require('./routes/fieldWorkerRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const apiRoutes = require('./routes/api');

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(morgan(process.env.LOG_LEVEL || 'combined'));
app.use(express.json());
// Add monitoring middleware
app.use(monitoring.middleware.requestDuration);

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    logger.logInfo('✅ MongoDB connected');
    monitoring.metrics.activeUsers.set(0); // Initialize active users metric
    
    // Initialize blockchain event listeners after MongoDB is connected
    try {
      // Get or create admin user for system events
      let adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        // Create a default admin if none exists
        adminUser = new User({
          name: 'System Admin',
          email: 'admin@system.com',
          password: require('crypto').randomBytes(16).toString('hex'),
          role: 'admin'
        });
        await adminUser.save();
        logger.logInfo('✅ Created default admin user for system events');
      }
      
      // Initialize contract event listeners
      const contracts = {
        AidDistribution: getContract('AidDistribution'),
        DonorTracking: getContract('DonorTracking'),
        RefugeeAccess: getContract('RefugeeAccess'),
        FieldWorker: getContract('FieldWorker')
      };
      
      // Try to get AidContract if it exists
      try {
        contracts.AidContract = getContract('AidContract');
      } catch (error) {
        logger.logInfo('ℹ️ AidContract not deployed, using individual contracts');
      }
      
      // Set up event listeners to store events in database
      blockchainEvents.setupEventListeners(contracts, adminUser._id);
      logger.logInfo('✅ Blockchain event listeners initialized');
    } catch (error) {
      logger.logError(`❌ Failed to initialize blockchain event listeners: ${error.message}`);
    }
  })
  .catch(err => logger.logError(`❌ MongoDB connection error: ${JSON.stringify(err)}`));

// 🔹 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/refugees', refugeeRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/field-worker', fieldWorkerRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/ipfs', ipfsRoutes);

// 🔹 Catch-all for unknown routes
app.use((req, res, next) => {
  logger.logError(`Not Found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Not Found' });
});

// 🔹 Error Handling Middleware
app.use((error, req, res, next) => {
  logger.logError(error.message);
  res.status(error.status || 500).json({ message: error.message });
});

// Clean shutdown function
const shutdown = () => {
  logger.logInfo('Shutting down server...');
  // Close database connection
  mongoose.connection.close(() => {
    logger.logInfo('MongoDB connection closed.');
    process.exit(0);
  });
};

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// 🔹 Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.logInfo(`🚀 Server running on port ${PORT}`));

module.exports = app;
