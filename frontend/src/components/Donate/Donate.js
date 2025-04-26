"use client"

import { useState, useEffect } from "react"
import { getContract } from "../../utils/contract"
import { formatEther, parseEther } from "ethers"
import "./Donate.css"

const Donate = () => {
  const [amount, setAmount] = useState("0.01") // Default to minimum required amount of 0.01 ETH
  const [message, setMessage] = useState("")
  const [balance, setBalance] = useState("0")

  // Fetch current donation balance when the component is mounted
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const contract = getContract()
        if (!contract) {
          setMessage("⚠️ Smart contract not available.")
          return
        }

        const balance = await contract.getTotalDonations()
        // Format balance to 4 decimal places
        const formatted = Number(formatEther(balance)).toFixed(4)
        setBalance(formatted)
      } catch (error) {
        console.error("Error fetching balance:", error)
        setMessage("⚠️ Failed to load balance.")
      }
    }

    loadBalance()
  }, [])

  // Function to handle donation
  const handleDonate = async () => {
    try {
      if (!amount || isNaN(amount) || Number.parseFloat(amount) <= 0) {
        setMessage("⚠️ Please enter a valid donation amount.")
        return
      }

      const contract = getContract()
      if (!contract) {
        setMessage("⚠️ Smart contract connection failed.")
        return
      }

      const tx = await contract.donate({ value: parseEther(amount) })
      await tx.wait()

      setMessage("✅ Donation successful! 🎉")

      // Update balance after donation
      const newBalance = await contract.getTotalDonations()
      // Format new balance to 4 decimal places
      const formatted = Number(formatEther(newBalance)).toFixed(4)
      setBalance(formatted)
    } catch (error) {
      console.error("Error donating:", error)
      setMessage(`❌ Transaction failed: ${error.message || "Unknown error"}`)
    }
  }

  return (
    <div className="donate-container">
      <h2>Donate to AidForge</h2>
      <input 
        type="number" 
        placeholder="Amount in ETH" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
        min="0.01"
      />
      <button onClick={handleDonate}>Donate</button>
      <p className={message.includes("✅") ? "message-success" : "message-error"}>{message}</p>
      <p>Total Donations: {balance} ETH</p>
    </div>
  )
}

export default Donate

