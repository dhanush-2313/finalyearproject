const utils = require('../utils'); // Import your utils
const crypto = require('crypto');

describe('Utils Tests', () => {

  it('should correctly encrypt and decrypt data', () => {
    const text = 'Hello, World!';
    const encrypted = utils.encrypt(text);
    const decrypted = utils.decrypt(encrypted);

    expect(decrypted).toBe(text);
  });

  it('should validate an email address correctly', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'test@com';

    expect(utils.isValidEmail(validEmail)).toBe(true);
    expect(utils.isValidEmail(invalidEmail)).toBe(false);
  });

  it('should generate a secure random string', () => {
    const randomString = utils.generateRandomString(16);

    expect(randomString).toHaveLength(16);
    expect(randomString).not.toBeNull();
  });

});