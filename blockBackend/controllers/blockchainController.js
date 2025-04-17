const { getContract } = require("../blockchain/gateway"); // Use ethers.js gateway

exports.getLatestBlock = async (req, res) => {
  try {
    const contract = getContract();
    const blockNumber = await contract.provider.getBlockNumber();
    res.json({ blockNumber });
  } catch (error) {
    console.error("Error fetching latest block:", error);
    res.status(500).json({ error: "Failed to fetch block number" });
  }
};

exports.addAidRecord = async (req, res) => {
  try {
    const { aidData } = req.body;
    if (!aidData || !aidData.recipient || !aidData.aidType || !aidData.amount) {
      return res.status(400).json({ error: 'Invalid aid data' });
    }
    const contract = getContract();
    const tx = await contract.addAidRecord(aidData.recipient, aidData.aidType, aidData.amount);
    await tx.wait();
    res.json({ message: 'Aid record added to blockchain', transactionHash: tx.hash });
  } catch (error) {
    console.error("Error adding aid record to blockchain:", error);
    res.status(500).json({ error: 'Error adding aid record to blockchain' });
  }
};

exports.queryAidRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = getContract();
    const record = await contract.getAidRecord(id);  // Assuming a function to fetch record by id
    res.json(record);
  } catch (error) {
    console.error("Error querying blockchain:", error);
    res.status(500).json({ error: 'Error querying blockchain' });
  }
};

exports.getBlockchainEvents = async (req, res) => {
  try {
    const contract = getContract();
    const events = await contract.queryFilter("*");  // Assuming a generic event filter
    res.json(events);
  } catch (error) {
    console.error("Error fetching blockchain events:", error);
    res.status(500).json({ error: 'Error fetching blockchain events' });
  }
};
