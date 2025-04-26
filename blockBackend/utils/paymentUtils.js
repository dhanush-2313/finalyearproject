const crypto = require('crypto');

// Generate a unique voucher code
function generateVoucherCode() {
  // Generate 8 random bytes and convert to hex
  const randomBytes = crypto.randomBytes(8).toString('hex');
  
  // Format the code in groups of 4 characters for better readability
  return randomBytes.match(/.{1,4}/g).join('-').toUpperCase();
}

module.exports = {
  generateVoucherCode
}; 