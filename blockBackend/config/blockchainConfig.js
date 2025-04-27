const path = require('path');
const fs = require('fs');

const contractPath = path.resolve(__dirname, '../../blockchain/artifacts/contracts/AidContract.sol/AidContract.json');

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
    rpcUrl: 'http://127.0.0.1:7545',
    networkId: 1337,
    contractAddresses: {
        AidDistribution: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        DonorTracking: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        RefugeeAccess: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        FieldWorker: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        AidContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    },
    contractPaths: {
        AidDistribution: '../../blockchain/artifacts/contracts/AidDistribution.sol/AidDistribution.json',
        DonorTracking: '../../blockchain/artifacts/contracts/DonorTracking.sol/DonorTracking.json',
        RefugeeAccess: '../../blockchain/artifacts/contracts/RefugeeAccess.sol/RefugeeAccess.json',
        FieldWorker: '../../blockchain/artifacts/contracts/FieldWorker.sol/FieldWorker.json',
        AidContract: '../../blockchain/artifacts/contracts/AidContract.sol/AidContract.json'
    },
    contractABI: contractJSON.abi
};
