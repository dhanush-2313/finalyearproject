"use client"

import { useState } from "react"
import { BrowserProvider, Contract, formatEther } from "ethers"
import contractABI from "../interfaces/AidDistribution.json"

function DonorTracking() {
  const [donorAddress, setDonorAddress] = useState("")
  const [donatedAmount, setDonatedAmount] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const CONTRACT_ADDRESS = process.env.REACT_APP_AID_DISTRIBUTION_CONTRACT

  const getDonorInfo = async () => {
    if (!window.ethereum) {
      setError("❌ MetaMask is not installed. Please install it to continue.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer)

      const amount = await contract.getDonorDetails(donorAddress)

      if (amount === 0) {
        throw new Error("❌ Donor not found or has not donated.")
      }

      // Format ETH amount to 4 decimal places
      const formattedAmount = Number(formatEther(amount)).toFixed(4)
      setDonatedAmount(formattedAmount)
    } catch (err) {
      console.error("Error fetching donor details:", err)
      setError(err.message || "❌ Failed to fetch donor details.")
      setDonatedAmount(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Donor Tracking</h1>
      <input
        type="text"
        placeholder="Enter Donor Address"
        value={donorAddress}
        onChange={(e) => setDonorAddress(e.target.value)}
      />
      <button onClick={getDonorInfo} disabled={loading}>
        {loading ? "Loading..." : "Get Donor Info"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {donatedAmount && (
        <div>
          <p>
            <strong>Total Donated Amount:</strong> {donatedAmount} ETH
          </p>
        </div>
      )}
    </div>
  )
}

export default DonorTracking

