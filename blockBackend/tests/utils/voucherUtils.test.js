const { generateVoucherCode, validateVoucherCode } = require('../../utils/voucherUtils');

describe('Voucher Utilities', () => {
  describe('generateVoucherCode', () => {
    it('should generate a valid voucher code in the correct format', () => {
      const code = generateVoucherCode();
      
      // Check format: XXXX-XXXX-X
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/);
      
      // Verify the code is valid
      expect(validateVoucherCode(code)).toBe(true);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const code = generateVoucherCode();
        codes.add(code);
      }

      expect(codes.size).toBe(iterations);
    });
  });

  describe('validateVoucherCode', () => {
    it('should validate correctly formatted codes', () => {
      const validCodes = [
        'A1B2-C3D4-5',
        '1234-5678-9',
        'ABCD-EFGH-1',
        '1A2B-3C4D-7'
      ];

      validCodes.forEach(code => {
        expect(validateVoucherCode(code)).toBe(true);
      });
    });

    it('should reject incorrectly formatted codes', () => {
      const invalidCodes = [
        'A1B2-C3D4',           // Missing checksum
        'A1B2C3D4-5',          // Wrong format
        'A1B2-C3D4-55',        // Extra checksum digit
        'A1B2-C3D4-5-6',       // Extra hyphen
        'a1b2-c3d4-5',         // Lowercase letters
        'A1B2-C3D4-@',         // Invalid character
        'A1B2C3D45',           // No hyphens
        'A1B2-C3D4-5-6-7'      // Too many parts
      ];

      invalidCodes.forEach(code => {
        expect(validateVoucherCode(code)).toBe(false);
      });
    });

    it('should reject codes with invalid checksums', () => {
      const code = 'A1B2-C3D4-5'; // Valid code
      const invalidChecksum = code.slice(0, -1) + '6'; // Change last digit
      expect(validateVoucherCode(invalidChecksum)).toBe(false);
    });
  });
}); 