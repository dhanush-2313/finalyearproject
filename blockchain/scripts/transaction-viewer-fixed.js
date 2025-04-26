const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const Table = require('cli-table3');
const chalk = require('chalk');

// You may need to install these packages:
// npm install cli-table3 chalk

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(chalk.blue.bold("\n🔍 BLOCKCHAIN TRANSACTION VIEWER\n"));
  
  // Get transaction hash from Hardhat task arguments
  // This will work with: npx hardhat view-tx --tx 0x123abc --network localhost
  const txHash = process.env.TX_HASH;
  
  if (!txHash) {
    console.log(chalk.yellow("Please provide a transaction hash:"));
    console.log(chalk.yellow("TX_HASH=0x123abc npx hardhat run scripts/transaction-viewer-fixed.js --network localhost"));
    return;
  }
  
  try {
    // Get the transaction and receipt
    const provider = ethers.provider;
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log(chalk.red("❌ Transaction not found"));
      return;
    }
    
    const receipt = await provider.getTransactionReceipt(txHash);
    const block = await provider.getBlock(tx.blockNumber);
    
    // Display transaction overview (like Etherscan header)
    console.log(chalk.green.bold("Transaction Details"));
    
    const overviewTable = new Table();
    overviewTable.push(
      [chalk.cyan("Transaction Hash:"), txHash],
      [chalk.cyan("Status:"), receipt.status ? chalk.green("✅ Success") : chalk.red("❌ Failed")],
      [chalk.cyan("Block:"), tx.blockNumber.toString()],
      [chalk.cyan("Timestamp:"), new Date(block.timestamp * 1000).toLocaleString()],
      [chalk.cyan("From:"), tx.from],
      [chalk.cyan("To:"), tx.to || "Contract Creation"],
      [chalk.cyan("Value:"), `${ethers.formatEther(tx.value)} ETH`],
      [chalk.cyan("Gas Price:"), `${ethers.formatUnits(tx.gasPrice, "gwei")} Gwei`],
      [chalk.cyan("Gas Used:"), receipt.gasUsed.toString()]
    );
    console.log(overviewTable.toString());
    
    // Display logs (events) if any
    if (receipt.logs.length > 0) {
      console.log(chalk.green.bold("\nEvent Logs"));
      
      // Try to decode logs if possible
      const decodedLogs = [];
      
      try {
        // Get all contract ABIs to try decoding events
        const artifactsDir = path.join(__dirname, "../artifacts/contracts");
        const contracts = [];
        
        // Find all contract ABIs
        function findABIs(dir) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              findABIs(filePath);
            } else if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
              try {
                const contractData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (contractData.abi) {
                  contracts.push({
                    name: path.basename(file, '.json'),
                    abi: contractData.abi
                  });
                }
              } catch (e) {
                // Skip invalid files
              }
            }
          }
        }
        findABIs(artifactsDir);
        
        // Try to decode each log with every contract ABI
        for (const log of receipt.logs) {
          let decoded = false;
          
          for (const contract of contracts) {
            try {
              const iface = new ethers.Interface(contract.abi);
              const parsedLog = iface.parseLog(log);
              
              if (parsedLog) {
                const args = {};
                for (const key in parsedLog.args) {
                  if (isNaN(parseInt(key))) {
                    const value = parsedLog.args[key];
                    args[key] = value.toString();
                  }
                }
                
                decodedLogs.push({
                  address: log.address,
                  name: `${contract.name}.${parsedLog.name}`,
                  args: args
                });
                
                decoded = true;
                break;
              }
            } catch (e) {
              // This ABI doesn't match this log, try the next one
            }
          }
          
          if (!decoded) {
            decodedLogs.push({
              address: log.address,
              name: "Unknown Event",
              data: log.data,
              topics: log.topics
            });
          }
        }
        
        // Display decoded logs
        for (let i = 0; i < decodedLogs.length; i++) {
          const log = decodedLogs[i];
          console.log(chalk.cyan(`\nLog #${i} - ${log.name} - Contract: ${log.address}`));
          
          if (log.name !== "Unknown Event") {
            const argsTable = new Table({
              head: [chalk.cyan('Parameter'), chalk.cyan('Value')]
            });
            
            for (const [key, value] of Object.entries(log.args)) {
              argsTable.push([key, value.toString()]);
            }
            
            console.log(argsTable.toString());
          } else {
            console.log(chalk.yellow("Raw data (could not decode):"));
            console.log(`Data: ${log.data}`);
            console.log(`Topics: ${log.topics.join(', ')}`);
          }
        }
      } catch (error) {
        console.log(chalk.yellow("Could not fully decode logs: " + error.message));
        
        // Display raw logs if decoding failed
        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          console.log(chalk.cyan(`\nLog #${i} - Contract: ${log.address}`));
          console.log(`Data: ${log.data}`);
          console.log(`Topics: ${log.topics.join(', ')}`);
        }
      }
    } else {
      console.log(chalk.yellow("\nNo event logs found in this transaction"));
    }
    
    console.log(chalk.blue.bold("\n🔍 END OF TRANSACTION DETAILS\n"));
    
  } catch (error) {
    console.error(chalk.red(`Error retrieving transaction: ${error.message}`));
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });