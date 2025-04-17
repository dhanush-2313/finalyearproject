require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const logger = require('./utils/logger');
const { getBlockchainEvents } = require('./blockchain/gateway');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const refugeeRoutes = require('./routes/refugeeRoutes');
const donorRoutes = require('./routes/donorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const fieldWorkerRoutes = require('./routes/fieldWorkerRoutes');
const apiRoutes = require('./routes/api');

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(morgan(process.env.LOG_LEVEL || 'combined'));
app.use(express.json());

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.logInfo('✅ MongoDB connected'))
  .catch(err => logger.logError(`❌ MongoDB connection error: ${JSON.stringify(err)}`));

// 🔹 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/refugees', refugeeRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/field-worker',fieldWorkerRoutes)
// 🔹 Start listening for blockchain events
getBlockchainEvents();

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

// 🔹 Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.logInfo(`🚀 Server running on port ${PORT}`));

module.exports = app;
