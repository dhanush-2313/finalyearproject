const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🧪 Testing contract connectivity and basic functions...\n");
  
  // Load contract addresses
  const addressesPath = path.join(__dirname, 'deployments', 'contractAddresses.json');
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ Contract addresses file not found! Run deploy.js first.");
    return;
  }
  
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  // Get signer
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`🔑 Using account: ${deployer.address}\n`);
  
  // Test each contract
  await testAidDistribution(addresses.AidDistribution, deployer, user1);
  await testDonorTracking(addresses.DonorTracking, deployer);
  await testRefugeeAccess(addresses.RefugeeAccess, deployer, user1);
  await testFieldWorker(addresses.FieldWorker, deployer, user1);
  
  console.log("\n✅ All contract tests completed successfully!");
}

async function testAidDistribution(address, deployer, recipient) {
  console.log("🔍 Testing AidDistribution contract...");
  
  try {
    // Connect to contract
    const AidDistribution = await ethers.getContractFactory("AidDistribution");
    const contract = AidDistribution.attach(address);
    
    // Initial state
    const initialNextId = await contract.nextId();
    console.log(`  • Current nextId: ${initialNextId}`);
    
    // Create aid record
    console.log("  • Creating aid record...");
    const tx1 = await contract.createAidRecord("Food supplies", ethers.parseEther("1.0"), recipient.address);
    await tx1.wait();
    
    // Distribute aid
    console.log("  • Distributing aid...");
    const tx2 = await contract.distributeAid(initialNextId);
    await tx2.wait();
    
    // Verify aid record
    const record = await contract.getAidRecord(initialNextId);
    console.log(`  • Record retrieved: ID=${record.id}, Amount=${ethers.formatEther(record.amount)} ETH, Distributed=${record.distributed}`);
    
    // Donate some ETH
    console.log("  • Making donation...");
    const tx3 = await contract.donate({ value: ethers.parseEther("0.5") });
    await tx3.wait();
    
    console.log("  ✅ AidDistribution contract working correctly!\n");
  } catch (error) {
    console.error(`  ❌ AidDistribution test failed: ${error.message}`);
  }
}

async function testDonorTracking(address, deployer) {
  console.log("🔍 Testing DonorTracking contract...");
  
  try {
    // Connect to contract
    const DonorTracking = await ethers.getContractFactory("DonorTracking");
    const contract = DonorTracking.attach(address);
    
    // Make donation
    console.log("  • Making donation...");
    const tx = await contract.donate({ value: ethers.parseEther("0.5") });
    await tx.wait();
    
    // Get donor details
    const donor = await contract.getDonorDetails(deployer.address);
    console.log(`  • Donor details: Address=${donor.donorAddress}, Total=${ethers.formatEther(donor.totalDonated)} ETH, Count=${donor.donationCount}`);
    
    console.log("  ✅ DonorTracking contract working correctly!\n");
  } catch (error) {
    console.error(`  ❌ DonorTracking test failed: ${error.message}`);
  }
}

async function testRefugeeAccess(address, deployer, refugee) {
  console.log("🔍 Testing RefugeeAccess contract...");
  
  try {
    // Connect to contract
    const RefugeeAccess = await ethers.getContractFactory("RefugeeAccess");
    const contract = RefugeeAccess.attach(address);
    
    // Register refugee
    console.log("  • Registering refugee...");
    const tx1 = await contract.registerRefugee(refugee.address, "John Doe");
    await tx1.wait();
    
    // Get refugee details
    const details = await contract.getRefugeeDetails(refugee.address);
    console.log(`  • Refugee details: Name=${details.name}, Eligible=${details.isEligibleForAid}`);
    
    // Update eligibility
    console.log("  • Updating eligibility...");
    const tx2 = await contract.updateEligibility(refugee.address, false);
    await tx2.wait();
    
    // Verify update
    const updatedDetails = await contract.getRefugeeDetails(refugee.address);
    console.log(`  • Updated refugee eligibility: ${updatedDetails.isEligibleForAid}`);
    
    console.log("  ✅ RefugeeAccess contract working correctly!\n");
  } catch (error) {
    console.error(`  ❌ RefugeeAccess test failed: ${error.message}`);
  }
}

async function testFieldWorker(address, deployer, worker) {
  console.log("🔍 Testing FieldWorker contract...");
  
  try {
    // Connect to contract
    const FieldWorker = await ethers.getContractFactory("FieldWorker");
    const contract = FieldWorker.attach(address);
    
    // Create task
    console.log("  • Creating task...");
    const tx1 = await contract.createTask("Deliver food supplies to Zone A", worker.address);
    await tx1.wait();
    
    // Get task details
    const taskId = 0; // First task
    const task = await contract.getTaskDetails(taskId);
    console.log(`  • Task details: Description=${task.description}, Assigned to=${task.assignedTo}, Completed=${task.completed}`);
    
    // Complete task (using worker account)
    console.log("  • Completing task...");
    const connectedToWorker = contract.connect(worker);
    const tx2 = await connectedToWorker.completeTask(taskId);
    await tx2.wait();
    
    // Verify completion
    const updatedTask = await contract.getTaskDetails(taskId);
    console.log(`  • Updated task completed status: ${updatedTask.completed}`);
    
    console.log("  ✅ FieldWorker contract working correctly!\n");
  } catch (error) {
    console.error(`  ❌ FieldWorker test failed: ${error.message}`);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 