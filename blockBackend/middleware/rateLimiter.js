const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Adjust based on your application's needs
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = rateLimiter;