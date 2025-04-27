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
const apiRoutes = require('./routes/api');
const mfaRoutes = require('./routes/mfaRoutes');

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(morgan(process.env.LOG_LEVEL || 'combined'));
app.use(express.json());

// Increase timeout for blockchain routes
app.use('/api/blockchain', (req, res, next) => {
  // Set timeout to 2 minutes for blockchain routes
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Add monitoring middleware
app.use(monitoring.middleware.requestDuration);

// Add redirect middleware for legacy URLs without /api prefix
app.use((req, res, next) => {
  const legacyPaths = ['/donors', '/refugees', '/admin', '/blockchain', '/field-worker', '/auth'];
  const path = req.path;
  
  // Check if the request matches any of our legacy paths
  const matchedPath = legacyPaths.find(legacyPath => path.startsWith(legacyPath));
  
  if (matchedPath) {
    const newPath = `/api${path}`;
    logger.logInfo(`Redirecting legacy path ${path} to ${newPath}`);
    req.url = newPath;
  }
  
  next();
});

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
app.use('/api/mfa', mfaRoutes);

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
