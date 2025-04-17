const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Ensure deployments folder exists
    const deploymentsDir = path.resolve(__dirname, 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    try {
        // Deploy AidDistribution
        const AidDistribution = await ethers.getContractFactory("AidDistribution");
        const aidDistribution = await AidDistribution.deploy();
        await aidDistribution.waitForDeployment();
        console.log("AidDistribution deployed at:", aidDistribution.target);

        // Deploy DonorTracking
        const DonorTracking = await ethers.getContractFactory("DonorTracking");
        const donorTracking = await DonorTracking.deploy();
        await donorTracking.waitForDeployment();
        console.log("DonorTracking deployed at:", donorTracking.target);

        // Deploy RefugeeAccess
        const RefugeeAccess = await ethers.getContractFactory("RefugeeAccess");
        const refugeeAccess = await RefugeeAccess.deploy();
        await refugeeAccess.waitForDeployment();
        console.log("RefugeeAccess deployed at:", refugeeAccess.target);

        // Deploy FieldWorker
        const FieldWorker = await ethers.getContractFactory("FieldWorker");
        const fieldWorker = await FieldWorker.deploy();
        await fieldWorker.waitForDeployment();
        console.log("FieldWorker deployed at:", fieldWorker.target);

        // Store contract addresses
        const contractAddresses = {
            AidDistribution: aidDistribution.target,
            DonorTracking: donorTracking.target,
            RefugeeAccess: refugeeAccess.target,
            FieldWorker: fieldWorker.target
        };
        fs.writeFileSync(path.join(deploymentsDir, 'contractAddresses.json'), JSON.stringify(contractAddresses, null, 2));

        console.log("Deployment successful! Contract addresses saved.");

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exitCode = 1;
    }
}

// Run the script
main().catch((error) => {
    console.error("Script failed:", error);
    process.exitCode = 1;
});
