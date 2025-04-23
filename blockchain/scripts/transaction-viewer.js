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
  
  // Get transaction hash from arguments or prompt for one
  let txHash = process.argv[2];
  if (!txHash) {
    console.log(chalk.yellow("Please provide a transaction hash as an argument:"));
    console.log(chalk.yellow("npx hardhat run scripts/transaction-viewer.js --network localhost 0x123...abc"));
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
      [chalk.cyan("Value:"), `${ethers.utils.formatEther(tx.value)} ETH`],
      [chalk.cyan("Gas Price:"), `${ethers.utils.formatUnits(tx.gasPrice, "gwei")} Gwei`],
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
              const iface = new ethers.utils.Interface(contract.abi);
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
    
    // Display internal transactions (this is a simplified version as hardhat doesn't track internal txs)
    console.log(chalk.green.bold("\nInternal Transactions"));
    console.log(chalk.yellow("Note: Internal transactions not available in local development chain"));
    
    // Function selector identification (like Etherscan's function decoder)
    if (tx.data && tx.data !== '0x') {
      console.log(chalk.green.bold("\nInput Data"));
      console.log(`Raw input: ${tx.data.slice(0, 66)}${tx.data.length > 66 ? '...' : ''}`);
      
      // Try to decode function call
      const functionSelector = tx.data.slice(0, 10);
      console.log(`Function selector: ${functionSelector}`);
      
      try {
        // Try to match function selector with known ABIs
        let foundFunction = false;
        
        for (const contract of contracts) {
          const iface = new ethers.utils.Interface(contract.abi);
          
          for (const fragment of Object.values(iface.functions)) {
            if (iface.getSighash(fragment) === functionSelector) {
              console.log(chalk.green(`Decoded as: ${contract.name}.${fragment.name}`));
              
              try {
                const decoded = iface.decodeFunctionData(fragment.name, tx.data);
                const paramsTable = new Table({
                  head: [chalk.cyan('Parameter'), chalk.cyan('Value')]
                });
                
                for (const key in decoded) {
                  if (isNaN(parseInt(key))) {
                    paramsTable.push([key, decoded[key].toString()]);
                  }
                }
                
                console.log(paramsTable.toString());
                foundFunction = true;
                break;
              } catch (e) {
                console.log(chalk.yellow(`Could not decode parameters: ${e.message}`));
              }
            }
          }
          
          if (foundFunction) break;
        }
        
        if (!foundFunction) {
          console.log(chalk.yellow("Could not decode function call"));
        }
      } catch (error) {
        console.log(chalk.yellow(`Could not decode function: ${error.message}`));
      }
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