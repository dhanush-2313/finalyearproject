/**
 * ERC-20 Token Reader Script
 * This script connects to a locally running Ganache blockchain and reads basic information
 * from an ERC-20 compliant smart contract.
 */

const Web3 = require('web3');

// Function to read ERC-20 token information
async function readERC20TokenInfo(contractAddress, contractABI) {
    try {
        // Connect to local Ganache instance
        const web3 = new Web3('http://127.0.0.1:7545');
        console.log('Connected to Ganache blockchain');

        // Check if connected
        const isConnected = await web3.eth.net.isListening();
        console.log(`Connection status: ${isConnected ? 'Connected' : 'Not connected'}`);

        // Get network ID
        const networkId = await web3.eth.net.getId();
        console.log(`Network ID: ${networkId}`);
        
        // Initialize the contract
        const tokenContract = new web3.eth.Contract(contractABI, contractAddress);
        console.log(`Contract initialized at address: ${contractAddress}`);

        // Get ERC-20 basic information
        const name = await tokenContract.methods.name().call();
        const symbol = await tokenContract.methods.symbol().call();
        const decimals = await tokenContract.methods.decimals().call();
        const totalSupply = await tokenContract.methods.totalSupply().call();

        // Format total supply based on decimals
        const formattedSupply = totalSupply / (10 ** decimals);

        // Print the contract information
        console.log('\n==== ERC-20 Token Information ====');
        console.log(`Name: ${name}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Decimals: ${decimals}`);
        console.log(`Total Supply: ${formattedSupply} ${symbol}`);

        // Get the accounts from Ganache
        const accounts = await web3.eth.getAccounts();
        console.log(`\nAvailable accounts: ${accounts.length}`);
        
        // Get balance of the first account
        if (accounts.length > 0) {
            const balance = await tokenContract.methods.balanceOf(accounts[0]).call();
            const formattedBalance = balance / (10 ** decimals);
            console.log(`Balance of ${accounts[0]}: ${formattedBalance} ${symbol}`);
        }

    } catch (error) {
        console.error('Error reading ERC-20 token information:');
        console.error(error);
    }
}

// Check if contract address and ABI are provided as command line arguments
if (process.argv.length < 4) {
    console.log('Usage: node erc20-reader.js <contract-address> <path-to-abi-json>');
    process.exit(1);
}

// Get contract address and ABI from command line arguments
const contractAddress = process.argv[2];
const abiPath = process.argv[3];

// Load ABI from file
const fs = require('fs');
let contractABI;
try {
    const abiString = fs.readFileSync(abiPath, 'utf8');
    contractABI = JSON.parse(abiString);
} catch (error) {
    console.error(`Error loading ABI from ${abiPath}:`, error.message);
    process.exit(1);
}

// Execute the function
console.log('Starting ERC-20 token info retrieval...');
readERC20TokenInfo(contractAddress, contractABI);
