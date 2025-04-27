const promClient = require('prom-client');
const logger = require('./logger');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'aidforge-backend'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [1, 10, 50, 100, 200, 500, 1000, 5000]
});

const apiCallsTotal = new promClient.Counter({
  name: 'api_calls_total',
  help: 'Total count of API calls',
  labelNames: ['method', 'endpoint']
});

const contractCallsTotal = new promClient.Counter({
  name: 'contract_calls_total',
  help: 'Total count of Ethereum contract calls',
  labelNames: ['method', 'contract']
});

const userRegistrationsTotal = new promClient.Counter({
  name: 'user_registrations_total',
  help: 'Total count of user registrations',
  labelNames: ['role']
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(apiCallsTotal);
register.registerMetric(contractCallsTotal);
register.registerMetric(userRegistrationsTotal);
register.registerMetric(activeUsers);

// Middleware to measure request duration
const requestDurationMiddleware = (req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, status: res.statusCode });
    
    // Also increment API calls counter
    apiCallsTotal.inc({ method: req.method, endpoint: route });
  });
  
  next();
};

logger.logInfo('✅ Monitoring metrics initialized');

module.exports = {
  register,
  metrics: {
    httpRequestDurationMicroseconds,
    apiCallsTotal,
    contractCallsTotal,
    userRegistrationsTotal,
    activeUsers
  },
  middleware: {
    requestDuration: requestDurationMiddleware
  }
}; 