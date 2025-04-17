// scripts/verifyContract.js

const { run } = require("hardhat");
const fs = require('fs');

// Load contract addresses
const contractAddresses = JSON.parse(fs.readFileSync('deployments/contractAddresses.json'));

async function main() {
    // Verify the AidDistribution contract
    console.log("Verifying AidDistribution contract...");
    await run("verify:verify", {
        address: contractAddresses.AidDistribution,
    });

    // Similarly, verify the other contracts
    console.log("Verifying DonorTracking contract...");
    await run("verify:verify", {
        address: contractAddresses.DonorTracking,
    });

    console.log("Verifying RefugeeAccess contract...");
    await run("verify:verify", {
        address: contractAddresses.RefugeeAccess,
    });

    console.log("Verifying FieldWorker contract...");
    await run("verify:verify", {
        address: contractAddresses.FieldWorker,
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
