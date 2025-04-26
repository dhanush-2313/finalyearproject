const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Transaction storage to save demonstration transactions
const TX_STORAGE_PATH = path.join(__dirname, 'demo-transactions.json');

// Helper to save transaction hashes for demonstration
async function saveTransaction(name, txHash) {
  let transactions = {};
  
  // Load existing transactions if available
  if (fs.existsSync(TX_STORAGE_PATH)) {
    transactions = JSON.parse(fs.readFileSync(TX_STORAGE_PATH, 'utf8'));
  }
  
  // Add new transaction
  transactions[name] = txHash;
  
  // Save to file
  fs.writeFileSync(TX_STORAGE_PATH, JSON.stringify(transactions, null, 2));
  console.log(chalk.green(`Transaction "${name}" saved: ${txHash}`));
}

// Demo scenarios
async function runSimpleDemo() {
  console.log(chalk.blue.bold("\n🚀 RUNNING SIMPLIFIED DEMO SEQUENCE\n"));
  
  try {
    // Get signers for different roles
    const [admin, donor, fieldWorker, refugee] = await ethers.getSigners();
    console.log(chalk.cyan("Demo accounts:"));
    console.log(`Admin: ${admin.address}`);
    console.log(`Donor: ${donor.address}`);
    console.log(`Field Worker: ${fieldWorker.address}`);
    console.log(`Refugee: ${refugee.address}\n`);
    
    // Load contract addresses
    // Here we're assuming the contracts are already deployed
    // If not, you would need to deploy them first using deploy.js
    const addresses = {
      AidDistribution: "0x1b4bF77EE4Ab26f3f508510b5B3568db7C9f8316",
      DonorTracking: "0x1d6224C17402Aac3e19d4cCb4A730E063a05F011",
      RefugeeAccess: "0x5cA2850142FF9c4b11Aa8A3F46cF0182A2B6E7A7",
      FieldWorker: "0x1E2be53982AE3eED2b372519be2711750ee87c48"
    };
    
    // Connect to contracts
    const AidDistribution = await ethers.getContractFactory("AidDistribution");
    const aidDistribution = AidDistribution.attach(addresses.AidDistribution);
    
    const DonorTracking = await ethers.getContractFactory("DonorTracking");
    const donorTracking = DonorTracking.attach(addresses.DonorTracking);
    
    // Step 1: Make a donation (as donor)
    console.log(chalk.yellow("\n1. Making donation as a donor...\n"));
    const donorContract = donorTracking.connect(donor);
    const donationTx = await donorContract.donate({ value: ethers.parseEther("1.0") });
    await donationTx.wait();
    await saveTransaction("donation", donationTx.hash);
    console.log(chalk.green("✅ Donation transaction successful"));
    
    // Step 2: Create aid record (as admin)
    console.log(chalk.yellow("\n2. Creating aid record as admin...\n"));
    const aidAmount = ethers.parseEther("0.5"); // 0.5 ETH
    const aidTx = await aidDistribution.createAidRecord(
      "Emergency food supplies", 
      aidAmount, 
      refugee.address
    );
    await aidTx.wait();
    const aidId = await aidDistribution.nextId() - 1n; // Get the ID that was just used
    await saveTransaction("create_aid", aidTx.hash);
    console.log(chalk.green("✅ Aid record created successfully"));
    
    // Step 3: Assign field worker to distribute aid
    console.log(chalk.yellow("\n3. Assigning field worker to distribute aid...\n"));
    const FieldWorker = await ethers.getContractFactory("FieldWorker");
    const fieldWorkerContract = FieldWorker.attach(addresses.FieldWorker);
    
    const taskTx = await fieldWorkerContract.createTask(
      `Deliver aid package #${aidId} to refugee at location XYZ`,
      fieldWorker.address
    );
    await taskTx.wait();
    const taskId = 0n; // First task is ID 0
    await saveTransaction("assign_task", taskTx.hash);
    console.log(chalk.green("✅ Field worker assignment successful"));
    
    // Step 4: Complete task (as field worker)
    console.log(chalk.yellow("\n4. Field worker completing assigned task...\n"));
    const fieldWorkerWithSigner = fieldWorkerContract.connect(fieldWorker);
    const completeTx = await fieldWorkerWithSigner.completeTask(taskId);
    await completeTx.wait();
    await saveTransaction("complete_task", completeTx.hash);
    console.log(chalk.green("✅ Task completion confirmed on blockchain"));
    
    // Step 5: Distribute aid to refugee
    console.log(chalk.yellow("\n5. Distributing aid to refugee...\n"));
    const distributeTx = await aidDistribution.distributeAid(aidId);
    await distributeTx.wait();
    await saveTransaction("distribute_aid", distributeTx.hash);
    console.log(chalk.green("✅ Aid distributed successfully"));
    
    console.log(chalk.green.bold("\n✅ Demo sequence completed successfully!\n"));
    
    // Show available transactions for viewing
    console.log(chalk.cyan("Demo transactions available for viewing:"));
    if (fs.existsSync(TX_STORAGE_PATH)) {
      const transactions = JSON.parse(fs.readFileSync(TX_STORAGE_PATH, 'utf8'));
      Object.keys(transactions).forEach(key => {
        console.log(`- ${key}: ${transactions[key]}`);
      });
      
      console.log(chalk.cyan("\nTo view details of a transaction, run:"));
      console.log(`npx hardhat view-tx --tx ${transactions['donation']} --network localhost`);
      console.log(`npx hardhat view-tx --tx ${transactions['create_aid']} --network localhost`);
      console.log(`npx hardhat view-tx --tx ${transactions['assign_task']} --network localhost`);
      console.log(`npx hardhat view-tx --tx ${transactions['complete_task']} --network localhost`);
      console.log(`npx hardhat view-tx --tx ${transactions['distribute_aid']} --network localhost`);
    }
  } catch (error) {
    console.error(chalk.red(`Demo failed: ${error.message}`));
  }
}

// Main function
async function main() {
  await runSimpleDemo();
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });