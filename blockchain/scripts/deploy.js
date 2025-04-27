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
        // Deploy AlternativePayments first
        const AlternativePayments = await ethers.getContractFactory("AlternativePayments");
        const alternativePayments = await AlternativePayments.deploy();
        await alternativePayments.waitForDeployment();
        console.log("AlternativePayments deployed at:", alternativePayments.target);

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

        // Deploy AidContract with AlternativePayments address
        const AidContract = await ethers.getContractFactory("AidContract");
        const aidContract = await AidContract.deploy(alternativePayments.target);
        await aidContract.waitForDeployment();
        console.log("AidContract deployed at:", aidContract.target);

        // Store contract addresses
        const contractAddresses = {
            AlternativePayments: alternativePayments.target,
            AidDistribution: aidDistribution.target,
            DonorTracking: donorTracking.target,
            RefugeeAccess: refugeeAccess.target,
            FieldWorker: fieldWorker.target,
            AidContract: aidContract.target
        };

        // Save contract addresses to file
        fs.writeFileSync(
            path.join(deploymentsDir, 'contractAddresses.json'),
            JSON.stringify(contractAddresses, null, 2)
        );

        console.log("Contract addresses saved to:", path.join(deploymentsDir, 'contractAddresses.json'));
    } catch (error) {
        console.error("Error deploying contracts:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
