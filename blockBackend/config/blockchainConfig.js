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
    networkId: 1337,
    contractAddresses: {
        AidDistribution: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        AidRequest: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        AidDelivery: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        AidStats: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        DonorTracking: '0xf6F39f608B06a16468e997D939846b3DeeB24d1b',
        RefugeeAccess: '0xb7496E0aC913a246A5a2d272B4CC493d1b962971',
        FieldWorker: '0x5c3F66d2d21993fdA4673757D94AfB82982D07E7'
    },
    contractPaths: {
        AidDistribution: 'contracts/AidDistribution.sol/AidDistribution.json',
        AidRequest: 'contracts/AidRequest.sol/AidRequest.json',
        AidDelivery: 'contracts/AidDelivery.sol/AidDelivery.json',
        AidStats: 'contracts/AidStats.sol/AidStats.json'
    },
    contractABI: contractJSON.abi
};
