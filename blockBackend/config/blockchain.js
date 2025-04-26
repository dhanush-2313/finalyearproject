const Web3 = require('web3');
const path = require('path');
require("dotenv").config();

if (!process.env.BLOCKCHAIN_RPC_URL) {
    console.error('BLOCKCHAIN_RPC_URL environment variable is missing');
    process.exit(1);
}

const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);

// Load deployed contract addresses
const contractAddresses = {
    AidDistribution: "0x78E3e19AE6f328bAC4Dd913B9AB76F4c2A5107bD",
    DonorTracking: "0x751607F1e1B484856651ad57d73595B5C74eF325",
    RefugeeAccess: "0xa7B027b0CFa51faad3a250Eea80762AC3386bbe1",
    FieldWorker: "0x0A16B2D189CF50Cb1C1A42106EE58814A1B979d9"
};

// Set path to blockchain project
const blockchainPath = path.join(__dirname, '../../blockchain');

// Load contract ABIs
const contractABIs = {
    AidDistribution: require(path.join(blockchainPath, 'artifacts/contracts/AidDistribution.sol/AidDistribution.json')).abi,
    DonorTracking: require(path.join(blockchainPath, 'artifacts/contracts/DonorTracking.sol/DonorTracking.json')).abi,
    RefugeeAccess: require(path.join(blockchainPath, 'artifacts/contracts/RefugeeAccess.sol/RefugeeAccess.json')).abi,
    FieldWorker: require(path.join(blockchainPath, 'artifacts/contracts/FieldWorker.sol/FieldWorker.json')).abi
};

// Initialize contract instances
const contracts = {
    AidDistribution: new web3.eth.Contract(contractABIs.AidDistribution, contractAddresses.AidDistribution),
    DonorTracking: new web3.eth.Contract(contractABIs.DonorTracking, contractAddresses.DonorTracking),
    RefugeeAccess: new web3.eth.Contract(contractABIs.RefugeeAccess, contractAddresses.RefugeeAccess),
    FieldWorker: new web3.eth.Contract(contractABIs.FieldWorker, contractAddresses.FieldWorker)
};

module.exports = { web3, contracts, contractAddresses, contractABIs };
