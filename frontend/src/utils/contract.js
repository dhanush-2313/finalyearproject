import { ethers } from "ethers"
import AidContractABI from "../artifacts/contracts/AidContract.sol/AidContract.json"

// Fallback to a placeholder address if environment variable is not set
const CONTRACT_ADDRESS = process.env.REACT_APP_AID_DISTRIBUTION_CONTRACT || "0x0000000000000000000000000000000000000000"

let provider = null
let signer = null
let contract = null

export const initializeEthers = async () => {
  if (!window.ethereum) {
    console.error("⚠️ MetaMask not detected! Please install MetaMask.")
    return
  }

  try {
    // Create a new provider
    provider = new ethers.BrowserProvider(window.ethereum)

    // Get the signer
    signer = await provider.getSigner().catch(() => {
      console.log("👉 User needs to connect wallet first")
      return null
    })

    if (signer) {
      // Create contract instance
      contract = new ethers.Contract(CONTRACT_ADDRESS, AidContractABI.abi, signer)
      console.log("✅ Contract initialized successfully!")
    }
  } catch (error) {
    console.error("❌ Failed to initialize ethers:", error)
  }
}

export const getContract = () => {
  if (!contract) {
    console.warn("⚠️ Contract instance is not initialized yet.")
    return null
  }
  return contract
}

// Function to get the latest block
export const getLatestBlock = async () => {
  if (!provider) {
    await initializeEthers()
    if (!provider) return null
  }

  try {
    const block = await provider.getBlock("latest")
    return {
      number: block.number,
      timestamp: new Date(block.timestamp * 1000).toLocaleString(),
      hash: block.hash,
    }
  } catch (error) {
    console.error("❌ Error fetching latest block:", error)
    return null
  }
}

// Mock function for development
export const mockGetAidRecords = () => {
  return [
    {
      id: 1,
      recipient: "Refugee Camp Alpha",
      aidType: "Food Supplies",
      amount: 1000,
      timestamp: new Date().toLocaleString(),
    },
    {
      id: 2,
      recipient: "Medical Center Beta",
      aidType: "Medical Supplies",
      amount: 500,
      timestamp: new Date().toLocaleString(),
    },
  ]
}

