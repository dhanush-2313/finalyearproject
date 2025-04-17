"use client"

import { useEffect, useState } from "react"
import { getContract } from "../../utils/contract"
import "./Home.css" // Import the corresponding CSS file

const Home = () => {
  const [totalDonations, setTotalDonations] = useState("0")

  useEffect(() => {
    const fetchTotalDonations = async () => {
      try {
        const contract = getContract()
        if (!contract) return

        const balance = await contract.getTotalDonations()
        setTotalDonations(balance.toString())
      } catch (error) {
        console.error("Error fetching donations:", error)
      }
    }

    fetchTotalDonations()
  }, [])

  return (
    <div className="home-container">
      <h1>Welcome to AidForge</h1>
      <p>Total Donations: {totalDonations} ETH</p>
    </div>
  )
}

export default Home

