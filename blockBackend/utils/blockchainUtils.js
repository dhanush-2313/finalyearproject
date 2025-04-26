const { getBlockchainGateway } = require('../config/blockchain');

const submitTransaction = async (transactionName, ...args) => {
  const gateway = await getBlockchainGateway();
  const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
  const contract = network.getContract(process.env.CONTRACT_NAME);

  try {
    const result = await contract.submitTransaction(transactionName, ...args);
    return result.toString();
  } catch (err) {
    console.error('Error submitting transaction:', err);
    throw err;
  } finally {
    gateway.disconnect();
  }
};

const evaluateTransaction = async (transactionName, ...args) => {
  const gateway = await getBlockchainGateway();
  const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
  const contract = network.getContract(process.env.CONTRACT_NAME);

  try {
    const result = await contract.evaluateTransaction(transactionName, ...args);
    return result.toString();
  } catch (err) {
    console.error('Error evaluating transaction:', err);
    throw err;
  } finally {
    gateway.disconnect();
  }
};

const generateDonationReceipt = async (donationData) => {
  const receipt = {
    receiptNumber: `DON-${Date.now()}`,
    timestamp: new Date().toISOString(),
    donor: {
      name: donationData.donorName,
      walletAddress: donationData.donorAddress
    },
    donation: {
      amount: donationData.amount,
      currency: 'ETH',
      cause: donationData.cause || 'General Aid'
    },
    transactionHash: donationData.transactionHash,
    status: 'Confirmed'
  };

  return receipt;
};

module.exports = { submitTransaction, evaluateTransaction, generateDonationReceipt };