// scripts/interact.js

const { ethers } = require("hardhat");
const fs = require('fs');

// Load contract addresses and ABIs
const contractAddresses = JSON.parse(fs.readFileSync('deployments/contractAddresses.json'));
const AidDistributionABI = require('../interfaces/AidDistribution.json');
const DonorTrackingABI = require('../interfaces/DonorTracking.json');

// Get the deployer's signer
async function main() {
    const [deployer] = await ethers.getSigners();

    // Interact with the AidDistribution contract
    const aidDistribution = new ethers.Contract(contractAddresses.AidDistribution, AidDistributionABI, deployer);
    const aidRecord = await aidDistribution.getAidRecord(1);
    console.log("Aid Record:", aidRecord);

    // Interact with the DonorTracking contract
    const donorTracking = new ethers.Contract(contractAddresses.DonorTracking, DonorTrackingABI, deployer);
    const donorDetails = await donorTracking.getDonorDetails(deployer.address);
    console.log("Donor Details:", donorDetails);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
