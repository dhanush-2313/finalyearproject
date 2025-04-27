const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Network configuration
const NETWORK_CONFIG = {
    url: "http://127.0.0.1:7545",
    chainId: 1337
};

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
    AidDistribution: '0xD80d09b883ff6408E35EaCceA8350B54B372ec57',
    RefugeeAccess: '0xB84AC1EE34529Ab5DB32396b042015A5cC890877'
};

// First Ganache account private key (this account has 100 ETH)
const PRIVATE_KEY = '0x77c0f4c0479b4b75cfa5f1e496db5bffe2acfa0be39f019c530b6381762ff20b';

async function testWorkflow() {
    try {
        console.log('🚀 Starting workflow test...');

        // Initialize provider
        const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.url, {
            chainId: NETWORK_CONFIG.chainId,
            name: 'ganache'
        });
        console.log('✅ Connected to provider');

        // Create wallet with private key
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const walletAddress = await wallet.getAddress();
        console.log(`\n👤 Using wallet address: ${walletAddress}`);

        // Get contract ABIs
        const aidDistributionPath = path.join(__dirname, '../../blockchain/artifacts/contracts/AidDistribution.sol/AidDistribution.json');
        const refugeeAccessPath = path.join(__dirname, '../../blockchain/artifacts/contracts/RefugeeAccess.sol/RefugeeAccess.json');

        const aidDistributionJson = JSON.parse(fs.readFileSync(aidDistributionPath, 'utf8'));
        const refugeeAccessJson = JSON.parse(fs.readFileSync(refugeeAccessPath, 'utf8'));

        // Create contract instances
        const aidDistribution = new ethers.Contract(CONTRACT_ADDRESSES.AidDistribution, aidDistributionJson.abi, wallet);
        const refugeeAccess = new ethers.Contract(CONTRACT_ADDRESSES.RefugeeAccess, refugeeAccessJson.abi, wallet);

        // Check wallet balance
        const balance = await provider.getBalance(walletAddress);
        console.log(`\n💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);

        // Step 1: Register as a refugee
        console.log('\n📝 Registering as refugee...');
        const registerTx = await refugeeAccess.registerRefugee(walletAddress, "Test Refugee");
        await registerTx.wait();
        console.log('✅ Registered as refugee');

        // Step 2: Make a donation
        console.log('\n💰 Making donation...');
        const donationAmount = ethers.parseEther("1.0"); // 1 ETH
        const donationTx = await aidDistribution.donate({ value: donationAmount });
        await donationTx.wait();
        console.log('✅ Donation successful');

        // Step 3: Create aid record
        console.log('\n📋 Creating aid record...');
        const aidRecordTx = await aidDistribution.createAidRecord(
            "Food Package", 
            ethers.parseEther("0.5"), 
            walletAddress
        );
        await aidRecordTx.wait();
        console.log('✅ Aid record created');

        // Step 4: Get the created aid record ID
        const nextId = await aidDistribution.nextId();
        const recordId = Number(nextId) - 1; // Convert BigInt to Number

        // Step 5: View aid record
        console.log('\n👀 Viewing aid record...');
        const aidRecord = await aidDistribution.getAidRecord(recordId);
        console.log('📋 Aid Record Details:');
        console.log(`- ID: ${aidRecord.id}`);
        console.log(`- Description: ${aidRecord.description}`);
        console.log(`- Amount: ${ethers.formatEther(aidRecord.amount)} ETH`);
        console.log(`- Recipient: ${aidRecord.recipient}`);
        console.log(`- Status: ${aidRecord.distributed ? 'Distributed' : 'Pending'}`);

        // Step 6: Mark aid as distributed
        console.log('\n📦 Marking aid as distributed...');
        const distributeTx = await aidDistribution.distributeAid(recordId);
        await distributeTx.wait();
        console.log('✅ Aid marked as distributed');

        // Step 7: Verify final status
        console.log('\n🔍 Verifying final status...');
        const finalRecord = await aidDistribution.getAidRecord(recordId);
        console.log(`Final Status: ${finalRecord.distributed ? 'Distributed' : 'Pending'}`);

        console.log('\n✅ Workflow test completed successfully!');
    } catch (error) {
        console.error('❌ Error in workflow test:', error);
        if (error.code === 'UNKNOWN_ERROR' && error.error?.message?.includes('nonce')) {
            console.error('\n⚠️ Nonce error detected. Please restart Ganache and try again.');
        }
    }
}

// Run the test
testWorkflow(); 