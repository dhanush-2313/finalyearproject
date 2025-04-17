// backend/utils/contractInteractions.js
const { ethers } = require("ethers");
require("dotenv").config();

// Set up the provider and signer (Infura and your wallet private key)
const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI of the deployed contract
const contractABI = require('../interfaces/AidDistribution.json');

// Contract address from .env
const contractAddress = process.env.CONTRACT_ADDRESS;

// Create the contract instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Function to get donor details
async function getDonorDetails(donorAddress) {
    try {
        const donorDetails = await contract.getDonorDetails(donorAddress); // Example contract method
        return donorDetails;
    } catch (error) {
        throw new Error(`Error fetching donor details: ${error.message}`);
    }
}

// Function to donate funds
async function donateFunds(donorAddress, amount) {
    try {
        const tx = await contract.donate(donorAddress, {
            value: ethers.parseUnits(amount, "ether")
        });
        await tx.wait();
        return tx;
    } catch (error) {
        throw new Error(`Error donating funds: ${error.message}`);
    }
}

module.exports = { getDonorDetails, donateFunds };
