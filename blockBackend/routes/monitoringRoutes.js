const express = require('express');
const router = express.Router();
const monitoring = require('../utils/monitoring');
const authMiddleware = require("../middleware/authMiddleware")
const logger = require('../utils/logger');
const { checkBlockchainHealth } = require('../blockchain/gateway');

// Endpoint to get Prometheus metrics (only accessible by admin)
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    res.set('Content-Type', monitoring.register.contentType);
    res.end(await monitoring.register.metrics());
  } catch (error) {
    logger.logError(`Error getting metrics: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Public health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check connection to various services
    const services = {
      api: { status: 'OK', timestamp: new Date().toISOString() },
      database: { status: 'OK' }, // In a real app, you might do a DB ping here
    };
    
    // Check blockchain health
    const blockchainStatus = await checkBlockchainHealth();
    services.blockchain = blockchainStatus;
    
    // Overall status is OK only if all services are OK
    const overallStatus = Object.values(services).every(
      service => service.status === 'OK' || service.connected === true
    ) ? 'OK' : 'DEGRADED';
    
    res.status(200).json({ 
      status: overallStatus,
      services,
      uptime: process.uptime()
    });
  } catch (error) {
    logger.logError(`Health check error: ${error.message}`);
    res.status(500).json({ 
      status: 'ERROR',
      error: error.message 
    });
  }
});

// Blockchain health check endpoint (more detailed than the overall health check)
router.get('/blockchain', authMiddleware, async (req, res) => {
  try {
    const health = await checkBlockchainHealth();
    res.status(200).json(health);
  } catch (error) {
    logger.logError(`Blockchain health check error: ${error.message}`);
    res.status(500).json({ 
      connected: false,
      error: error.message 
    });
  }
});

// System info endpoint (protected)
router.get('/info', authMiddleware, (req, res) => {
  const info = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  res.status(200).json(info);
});

module.exports = router; 