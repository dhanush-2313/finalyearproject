const Web3 = require('web3');
require("dotenv").config();

if (!process.env.BLOCKCHAIN_RPC_URL) {
    console.error('BLOCKCHAIN_RPC_URL environment variable is missing');
    process.exit(1);
  }
  
  const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);

// Load deployed contract ABI & Address
const contractABI = require("../artifacts/contracts/AidContract.sol/AidContract.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

const aidContract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = { web3, aidContract };
