// scripts/fundContract.js

const { ethers } = require("hardhat");
const fs = require('fs');

// Load contract address
const contractAddresses = JSON.parse(fs.readFileSync('deployments/contractAddresses.json'));

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Funding contract with account:", deployer.address);

    // Specify the contract you want to fund
    const aidDistribution = await ethers.getContractAt("AidDistribution", contractAddresses.AidDistribution);

    // Send ETH to the contract (10 ETH in this example)
    const tx = await deployer.sendTransaction({
        to: contractAddresses.AidDistribution,
        value: ethers.utils.parseEther("10")
    });

    console.log("Transaction Hash:", tx.hash);
    await tx.wait();
    console.log("Funding transaction successful!");

    // Alternatively, fund the contract with ERC20 tokens if needed
    // const tokenAddress = "ERC20_TOKEN_ADDRESS";
    // const tokenContract = await ethers.getContractAt("IERC20", tokenAddress);
    // const txToken = await tokenContract.transfer(contractAddresses.AidDistribution, ethers.utils.parseUnits("1000", 18));
    // console.log("Token Transfer Hash:", txToken.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
