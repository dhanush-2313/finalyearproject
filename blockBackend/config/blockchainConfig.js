const path = require('path');
const fs = require('fs');

const contractPath = path.resolve(__dirname, '../../Blockchain/artifacts/contracts/AidContract.sol/AidContract.json');

if (!fs.existsSync(contractPath)) {
    console.error(`❌ Contract ABI file not found at: ${contractPath}`);
    process.exit(1);
}

const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

if (!contractJSON.abi || contractJSON.abi.length === 0) {
    console.error(`❌ ABI is missing in ${contractPath}`);
    process.exit(1);
}

console.log(`✅ ABI successfully loaded from ${contractPath}`);

module.exports = {
    network: 'localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    contractAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    contractABI: contractJSON.abi,  // ✅ Explicitly export ABI
    privateKey: '0xdfba48bf2cfdc3db33ed2ec79b503b0c909f06cd3b04076bb36eb902b1d46ff0'
};
