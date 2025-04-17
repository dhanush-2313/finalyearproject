"use client"

import { useState } from "react"
import "./connectWallet.css"

const ConnectWallet = ({ account, connectWallet }) => {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it and try again.")
      return
    }

    if (isConnecting || account) {
      console.warn("⚠️ Already connecting or wallet is already connected.")
      return
    }

    setIsConnecting(true)

    try {
      await connectWallet()
    } catch (error) {
      console.error("❌ Wallet connection failed:", error)
      alert("Wallet connection failed. Please try again.")
    }

    setIsConnecting(false)
  }

  return (
    <div className="connect-wallet">
      {account ? (
        <p>
          ✅ Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </p>
      ) : (
        <button onClick={handleConnectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  )
}

export default ConnectWallet

