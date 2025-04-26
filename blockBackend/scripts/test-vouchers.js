const { generateVoucherCode, validateVoucherCode } = require('../utils/voucherUtils');

// Test voucher generation
console.log('Generating sample vouchers:');
for (let i = 0; i < 5; i++) {
    const code = generateVoucherCode();
    console.log(`Voucher ${i + 1}: ${code}`);
    console.log(`Is valid? ${validateVoucherCode(code)}`);
    console.log('---');
}

// Test validation with known examples
console.log('\nTesting validation with known examples:');
const examples = [
    'A1B2-C3D4-5',
    '1234-5678-9',
    'ABCD-EFGH-1',
    'INVALID-CODE',
    'A1B2-C3D4-5-6'
];

examples.forEach(code => {
    console.log(`Code: ${code}`);
    console.log(`Is valid? ${validateVoucherCode(code)}`);
    console.log('---');
}); 