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
async function runFullDemo() {
  console.log(chalk.blue.bold("\n🚀 RUNNING FULL DEMO SEQUENCE\n"));
  
  try {
    // Get signers for different roles
    const [admin, donor, fieldWorkerSigner, refugee] = await ethers.getSigners();
    console.log(chalk.cyan("Demo accounts:"));
    console.log(`Admin: ${admin.address}`);
    console.log(`Donor: ${donor.address}`);
    console.log(`Field Worker: ${fieldWorkerSigner.address}`);
    console.log(`Refugee: ${refugee.address}\n`);
    
    // Load contract addresses
    const addressesPath = path.join(__dirname, 'deployments', 'contractAddresses.json');
    if (!fs.existsSync(addressesPath)) {
      console.error(chalk.red("❌ Contract addresses file not found! Run deploy.js first."));
      return;
    }
    
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    // Connect to contracts
    const AidDistribution = await ethers.getContractFactory("AidDistribution");
    const aidDistribution = AidDistribution.attach(addresses.AidDistribution);
    
    const DonorTracking = await ethers.getContractFactory("DonorTracking");
    const donorTracking = DonorTracking.attach(addresses.DonorTracking);
    
    const RefugeeAccess = await ethers.getContractFactory("RefugeeAccess");
    const refugeeAccess = RefugeeAccess.attach(addresses.RefugeeAccess);
    
    const FieldWorker = await ethers.getContractFactory("FieldWorker");
    const fieldWorkerContract = FieldWorker.attach(addresses.FieldWorker);
    
    // 1. Register a refugee (as admin)
    console.log(chalk.yellow("\n1. Registering refugee...\n"));
    const regTx = await refugeeAccess.registerRefugee(refugee.address, "John Doe");
    await regTx.wait();
    await saveTransaction("register_refugee", regTx.hash);
    
    // 2. Make a donation (as donor)
    console.log(chalk.yellow("\n2. Making donation...\n"));
    const donorContract = donorTracking.connect(donor);
    const donationTx = await donorContract.donate({ value: ethers.parseEther("1.0") });
    await donationTx.wait();
    await saveTransaction("make_donation", donationTx.hash);
    
    // 3. Create aid record (as admin)
    console.log(chalk.yellow("\n3. Creating aid record...\n"));
    // Convert amount to a regular number instead of BigInt
    const aidAmount = 500000000000000000n; // 0.5 ETH in wei as BigInt
    const aidTx = await aidDistribution.createAidRecord(
      "Emergency food supplies", 
      aidAmount, 
      refugee.address
    );
    await aidTx.wait();
    const aidId = (await aidDistribution.nextId()) - 1n; // Get the ID that was just used
    await saveTransaction("create_aid", aidTx.hash);
    
    // 4. Assign task to field worker
    console.log(chalk.yellow("\n4. Assigning task to field worker...\n"));
    const taskTx = await fieldWorkerContract.createTask(`Deliver aid package #${aidId.toString()} to refugee`, fieldWorkerSigner.address);
    await taskTx.wait();
    await saveTransaction("assign_task", taskTx.hash);
    
    // 5. Complete task (as field worker)
    console.log(chalk.yellow("\n5. Field worker completing task...\n"));
    const fieldWorkerWithSigner = fieldWorkerContract.connect(fieldWorkerSigner);
    const taskId = 0n; // First task is ID 0
    const completeTx = await fieldWorkerWithSigner.completeTask(taskId);
    await completeTx.wait();
    await saveTransaction("complete_task", completeTx.hash);
    
    // 6. Distribute aid
    console.log(chalk.yellow("\n6. Distributing aid to refugee...\n"));
    const distributeTx = await aidDistribution.distributeAid(aidId);
    await distributeTx.wait();
    await saveTransaction("distribute_aid", distributeTx.hash);
    
    console.log(chalk.green.bold("\n✅ Demo sequence completed successfully!\n"));
    
    // Show available transactions for viewing
    console.log(chalk.cyan("Demo transactions available for viewing:"));
    if (fs.existsSync(TX_STORAGE_PATH)) {
      const transactions = JSON.parse(fs.readFileSync(TX_STORAGE_PATH, 'utf8'));
      Object.keys(transactions).forEach(key => {
        console.log(`- ${key}: ${transactions[key]}`);
      });
      
      console.log(chalk.cyan("\nTo view details of a transaction, run:"));
      console.log(`npx hardhat run scripts/transaction-viewer.js --network localhost ${transactions['distribute_aid']}`);
    }
  } catch (error) {
    console.error(chalk.red(`Demo failed: ${error.message}`));
  }
}

// Main function
async function main() {
  await runFullDemo();
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 