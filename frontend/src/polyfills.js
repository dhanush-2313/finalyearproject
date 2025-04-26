// Polyfill for process
if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };
}

// Polyfill for Buffer
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
} 