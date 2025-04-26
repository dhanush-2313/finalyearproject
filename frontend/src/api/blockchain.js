import { getContract } from "../utils/contract"
import api from "./api"

// 📌 Fetch the latest block from the blockchain smart contract
export const getLatestBlock = async () => {
  try {
    // First try to get block from the backend API
    try {
      // Use the api client that's already correctly configured with base URL
      const response = await api.get('/blockchain/latest-block');
      if (response.data) {
        return {
          number: response.data.blockNumber,
          timestamp: new Date().toLocaleString(),
          hash: response.data.blockHash || 'Not available'
        };
      }
    } catch (apiError) {
      console.warn("Failed to fetch block from API, falling back to direct contract:", apiError);
    }

    // Fallback to direct contract interaction
    const contract = getContract()
    if (!contract) {
      console.error("❌ Smart contract instance not found.")
      return null
    }

    // ✅ Ensure the contract has a valid provider
    const provider = contract.provider
    if (!provider) {
      console.error("❌ Provider is missing in contract.")
      return null
    }

    const latestBlock = await provider.getBlock("latest") // ✅ Get latest block safely
    return {
      number: latestBlock.number,
      timestamp: new Date(latestBlock.timestamp * 1000).toLocaleString(),
      hash: latestBlock.hash,
    }
  } catch (error) {
    console.error("❌ Error fetching latest block:", error)
    return null
  }
}

// 📌 Fetch aid records from API or smart contract
export const getLatestAidRecords = async () => {
  try {
    // First try to get records from the backend API
    try {
      const response = await api.get('/blockchain/aid');
      if (response.data && response.data.success) {
        return response.data.records || [];
      }
    } catch (apiError) {
      console.warn("Failed to fetch records from API, falling back to direct contract:", apiError);
    }

    // Fallback to direct contract interaction
    const contract = getContract()
    if (!contract) {
      console.error("❌ Smart contract instance not found.")
      return []
    }

    const records = await contract.getAidRecords()
    return records.map((record) => ({
      id: Number(record.id) || 0,
      recipient: record.recipient,
      aidType: record.aidType || "Aid Distribution",
      amount: Number(record.amount) || 0,
      status: record.status || "Pending",
      timestamp: new Date(Number(record.timestamp || Date.now()) * 1000).toLocaleString(),
    }))
  } catch (error) {
    console.error("❌ Error fetching aid records:", error)
    return []
  }
}

// 📌 Add a new aid record through API or smart contract
export const addAidRecord = async (recordData) => {
  if (!recordData.recipient || !recordData.aidType || !recordData.amount) {
    throw new Error("Recipient, aid type, and amount are required")
  }
  
  try {
    // First try to add record via the backend API
    try {
      const response = await api.post('/blockchain/aid', recordData);
      if (response.data && response.data.success) {
        return response;
      }
    } catch (apiError) {
      console.warn("Failed to add record via API, falling back to direct contract:", apiError);
      // If API gives specific error, throw it
      if (apiError.response && apiError.response.data && apiError.response.data.error) {
        throw new Error(apiError.response.data.error);
      }
    }

    // Fallback to direct contract interaction
    const contract = getContract()
    if (!contract) {
      throw new Error("Smart contract instance not found.")
    }
    
    // Convert ETH to wei if needed
    let amountInWei = recordData.amount;
    if (!amountInWei.toString().includes('e+')) {
      // If amount is in ETH, convert to wei
      const ethers = await import('ethers');
      amountInWei = ethers.parseEther(recordData.amount.toString());
    }
    
    const tx = await contract.addAidRecord(
      recordData.recipient, 
      recordData.aidType, 
      amountInWei.toString(),
      { gasLimit: 1000000 }
    );
    await tx.wait();
    
    return {
      data: {
        success: true,
        txHash: tx.hash,
        message: "Aid record added successfully via direct contract interaction"
      }
    };
  } catch (error) {
    console.error("❌ Error adding aid record:", error.message || error)
    throw error
  }
}

// 📌 Verify a transaction on the blockchain
export const verifyTransaction = async (txHash) => {
  try {
    // Try to verify via API first
    try {
      const response = await api.get(`/blockchain/verify/${txHash}`);
      if (response.data && response.data.success) {
        return response.data.verification;
      }
    } catch (apiError) {
      console.warn("Failed to verify transaction via API, falling back to direct check:", apiError);
    }
    
    // Fallback to direct contract provider
    const contract = getContract();
    if (!contract || !contract.provider) {
      throw new Error("Contract or provider not available");
    }
    
    const tx = await contract.provider.getTransaction(txHash);
    if (!tx) {
      return { verified: false, reason: "Transaction not found" };
    }
    
    const receipt = await contract.provider.getTransactionReceipt(txHash);
    return {
      verified: receipt && receipt.status === 1,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString() || "0",
      receipt: receipt
    };
  } catch (error) {
    console.error("❌ Error verifying transaction:", error);
    return { verified: false, reason: error.message };
  }
}

// 📌 Update aid status through API or smart contract
export const updateAidStatus = async (id, status) => {
  try {
    // Try API first
    try {
      const response = await api.put(`/blockchain/aid/${id}`, { status });
      if (response.data && response.data.success) {
        return response;
      }
    } catch (apiError) {
      console.warn("Failed to update status via API, falling back to direct contract:", apiError);
      if (apiError.response?.data?.error) {
        throw new Error(apiError.response.data.error);
      }
    }

    // Fallback to direct contract interaction
    const contract = getContract();
    if (!contract) {
      throw new Error("Smart contract instance not found.");
    }

    const tx = await contract.updateAidStatus(id, status, { gasLimit: 100000 });
    await tx.wait();

    return {
      data: {
        success: true,
        txHash: tx.hash,
        message: `Aid status updated to ${status} successfully via direct contract interaction`
      }
    };
  } catch (error) {
    console.error("❌ Error updating aid status:", error.message || error);
    throw error;
  }
}

export default {
  getLatestBlock,
  getLatestAidRecords,
  addAidRecord,
  verifyTransaction,
  updateAidStatus
}

