const { addAidRecord, initializeConnection } = require('../blockchain/gateway');
const { ethers } = require('ethers');

async function addSampleAidRecords() {
    try {
        // Wait for contract initialization
        console.log("Initializing blockchain connection...");
        await initializeConnection();
        console.log("Blockchain connection initialized successfully!");

        // Sample aid records
        const sampleRecords = [
            {
                recipient: "0x1234567890123456789012345678901234567890",
                aidType: "Food Package",
                amount: "0.5" // 0.5 ETH
            },
            {
                recipient: "0x0987654321098765432109876543210987654321",
                aidType: "Medical Supplies",
                amount: "1.0" // 1.0 ETH
            },
            {
                recipient: "0xabcdef1234567890abcdef1234567890abcdef12",
                aidType: "Shelter Support",
                amount: "2.0" // 2.0 ETH
            },
            {
                recipient: "0x1111111111111111111111111111111111111111",
                aidType: "Education Support",
                amount: "0.75" // 0.75 ETH
            },
            {
                recipient: "0x2222222222222222222222222222222222222222",
                aidType: "Emergency Relief",
                amount: "1.5" // 1.5 ETH
            }
        ];

        console.log("Adding sample aid records...");
        
        for (const record of sampleRecords) {
            try {
                // Convert amount to wei
                const amountInWei = ethers.parseEther(record.amount);
                
                console.log(`Adding record: ${record.aidType} for ${record.recipient}`);
                const result = await addAidRecord(
                    record.recipient,
                    record.aidType,
                    amountInWei.toString(),
                    "ETH",
                    "",
                    { gasLimit: 500000 }
                );
                
                console.log(`✅ Record added successfully! Transaction hash: ${result.hash}`);
                
                // Wait for transaction to be mined
                const receipt = await result.wait(1);
                console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
                
            } catch (error) {
                console.error(`❌ Error adding record: ${error.message}`);
            }
        }
        
        console.log("Finished adding sample aid records!");
    } catch (error) {
        console.error("❌ Script failed:", error);
    }
}

// Run the script
addSampleAidRecords(); 