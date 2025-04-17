// utils/contractInteractions.js

const { ethers } = require("ethers");
const { contractAddresses, networks } = require("./constants");
require("dotenv").config();

// Setup provider based on the network
const getProvider = (network) => {
  const { url } = networks[network];
  return new ethers.JsonRpcProvider(url);
};

// Setup contract instance
const getContract = (contractName, network) => {
  const contractAddress = contractAddresses[contractName][network];
  const provider = getProvider(network);
  const abi = require(`../interfaces/${contractName}.json`).abi;
  return new ethers.Contract(contractAddress, abi, provider);
};

// Example function to interact with AidDistribution contract
const createAidRecord = async (network, receiver, amount) => {
  const contract = getContract("AidDistribution", network);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, contract.provider);
  const contractWithSigner = contract.connect(signer);
  
  try {
    const tx = await contractWithSigner.createAidRecord(receiver, amount);
    await tx.wait();
    console.log("Aid record created successfully");
  } catch (error) {
    console.error("Error creating aid record:", error);
  }
};

module.exports = { createAidRecord };
