const { connectGateway } = require('./gateway');
const logger = require('../utils/logger');

const queryBlockchain = async (chaincodeName, functionName, ...args) => {
  try {
    const gateway = await connectGateway();
    if (!gateway) {
      throw new Error('Failed to connect to the gateway');
    }
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract(chaincodeName);

    const result = await contract.evaluateTransaction(functionName, ...args);
    logger.logInfo(`Query result: ${result.toString()}`);
    gateway.disconnect();

    return result.toString();
  } catch (error) {
    logger.logError('Error querying blockchain:', error);
    throw new Error('Failed to query the blockchain');
  }
};