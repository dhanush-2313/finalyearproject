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

// Helper to view a saved transaction
async function viewTransaction(name) {
  if (!fs.existsSync(TX_STORAGE_PATH)) {
    console.log(chalk.red("No saved transactions found."));
    return;
  }
  
  const transactions = JSON.parse(fs.readFileSync(TX_STORAGE_PATH, 'utf8'));
  
  if (!transactions[name]) {
    console.log(chalk.red(`Transaction "${name}" not found.`));
    console.log(chalk.yellow("Available transactions:"));
    Object.keys(transactions).forEach(key => {
      console.log(`- ${key}: ${transactions[key]}`);
    });
    return;
  }
  
  // Execute transaction viewer
  const { execSync } = require('child_process');
  try {
    execSync(`npx hardhat run scripts/transaction-viewer.js --network localhost ${transactions[name]}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red(`Error viewing transaction: ${error.message}`));
  }
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
    const donationTx = await donorContract.donate({ value: ethers.utils.parseEther("1.0") });
    await donationTx.wait();
    await saveTransaction("make_donation", donationTx.hash);
    
    // 3. Create aid record (as admin)
    console.log(chalk.yellow("\n3. Creating aid record...\n"));
    const aidTx = await aidDistribution.createAidRecord(
      "Emergency food supplies", 
      ethers.utils.parseEther("0.5"), 
      refugee.address
    );
    await aidTx.wait();
    const aidId = (await aidDistribution.nextId()) - 1; // Get the ID that was just used
    await saveTransaction("create_aid", aidTx.hash);
    
    // 4. Assign task to field worker
    console.log(chalk.yellow("\n4. Assigning task to field worker...\n"));
    const taskTx = await fieldWorkerContract.createTask(`Deliver aid package #${aidId} to refugee`, fieldWorkerSigner.address);
    await taskTx.wait();
    await saveTransaction("assign_task", taskTx.hash);
    
    // 5. Complete task (as field worker)
    console.log(chalk.yellow("\n5. Field worker completing task...\n"));
    const fieldWorkerWithSigner = fieldWorkerContract.connect(fieldWorkerSigner);
    const taskId = 0; // First task is ID 0
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
      console.log(`npx hardhat run scripts/demo-helper.js --network localhost view register_refugee`);
      console.log(`npx hardhat run scripts/transaction-viewer.js --network localhost ${transactions['distribute_aid']}`);
    }
  } catch (error) {
    console.error(chalk.red(`Demo failed: ${error.message}`));
  }
}

// Main function
async function main() {
  // Find command in process.argv - look for 'run', 'view', 'list', or default to 'help'
  // When running with npx hardhat run, our command will be after the script name
  let command = 'help';
  let viewName = null;
  
  // Search through all arguments for our commands
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === 'run') {
      command = 'run';
      break;
    } else if (process.argv[i] === 'view' && process.argv[i+1]) {
      command = 'view';
      viewName = process.argv[i+1];
      break;
    } else if (process.argv[i] === 'list') {
      command = 'list';
      break;
    }
  }
  
  if (command === "run") {
    await runFullDemo();
  } else if (command === "view" && viewName) {
    await viewTransaction(viewName);
  } else if (command === "list") {
    if (fs.existsSync(TX_STORAGE_PATH)) {
      const transactions = JSON.parse(fs.readFileSync(TX_STORAGE_PATH, 'utf8'));
      console.log(chalk.cyan("Saved transactions:"));
      Object.keys(transactions).forEach(key => {
        console.log(`- ${key}: ${transactions[key]}`);
      });
    } else {
      console.log(chalk.yellow("No saved transactions found."));
    }
  } else {
    console.log(chalk.cyan("Humanitarian Aid Blockchain Demo Helper"));
    console.log(chalk.cyan("Available commands:"));
    console.log("  run               - Run full demo sequence");
    console.log("  view [name]       - View transaction details by name");
    console.log("  list              - List all saved transactions");
    console.log("\nExamples:");
    console.log("  npx hardhat run scripts/demo-helper.js --network localhost -- run");
    console.log("  npx hardhat run scripts/demo-helper.js --network localhost -- view distribute_aid");
    console.log("  npx hardhat run scripts/demo-helper.js --network localhost -- list");
  }
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 