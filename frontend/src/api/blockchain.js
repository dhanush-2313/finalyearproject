import { getContract } from "../utils/contract"

// 📌 Fetch the latest block from the blockchain smart contract
export const getLatestBlock = async () => {
  try {
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

// 📌 Fetch aid records from the smart contract
export const getLatestAidRecords = async () => {
  try {
    const contract = getContract()
    if (!contract) {
      console.error("❌ Smart contract instance not found.")
      return []
    }

    const records = await contract.getAidRecords()
    return records.map((record) => ({
      recipient: record.recipient,
      aidType: record.aidType,
      amount: Number(record.amount),
      timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString(),
    }))
  } catch (error) {
    console.error("❌ Error fetching aid records:", error)
    return []
  }
}

// 📌 Add a new aid record to the smart contract
export const addAidRecord = async (recipient, aidType, amount) => {
  if (!recipient || !aidType || !amount) {
    throw new Error("Recipient, aid type, and amount are required")
  }
  try {
    const contract = getContract()
    if (!contract) {
      throw new Error("Smart contract instance not found.")
    }
    const tx = await contract.addAidRecord(recipient, aidType, amount, { gasLimit: 1000000 })
    await tx.wait()
    return true
  } catch (error) {
    console.error("❌ Error adding aid record:", error.message || error)
    throw error
  }
}

