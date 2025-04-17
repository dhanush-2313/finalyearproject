import { ethers } from "ethers"

let isConnecting = false

export const connectWallet = async () => {
  if (isConnecting) {
    console.warn("⚠️ MetaMask connection is already in progress...")
    return null
  }

  try {
    if (!window.ethereum) {
      console.error("⚠️ MetaMask not detected!")
      alert("MetaMask is not installed. Please install it and try again.")
      return null
    }

    isConnecting = true

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])

    // Check if the user is on the correct network
    const network = await provider.getNetwork()
    if (network.chainId !== 1) {
      // Replace 1 with your desired chain ID
      alert("Please switch to the Ethereum Mainnet.")
      return null
    }

    const signer = provider.getSigner()
    const account = await signer.getAddress()
    console.log("✅ Wallet connected:", account)

    return { account, signer }
  } catch (error) {
    console.error("❌ MetaMask connection error:", error)
    alert(`MetaMask Connection Error: ${error.message}`)
    return null
  } finally {
    isConnecting = false
  }
}

