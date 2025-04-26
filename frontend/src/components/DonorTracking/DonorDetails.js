"use client"

import { useState, useEffect } from "react"
import { donorAPI } from "../../api/api"
import { formatEther } from "ethers"

const DonorDetails = ({ onDonationClick }) => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true)
        const response = await donorAPI.getDonations()
        if (response.data) {
          const formattedDonations = response.data.map(donation => ({
            ...donation,
            amount: Number(formatEther(donation.amount)).toFixed(4)
          }))
          setDonations(formattedDonations)
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching donations:", err)
        setError("Failed to load donations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  if (loading) return <div className="loading">Loading donations...</div>
  
  if (error) return <div className="error">{error}</div>

  return (
    <div className="donor-details">
      <h2>Your Donations</h2>
      {donations.length > 0 ? (
        <ul>
          {donations.map((donation) => (
            <li
              key={donation._id}
              className={`donation-item donation-${(donation.status || "pending").toLowerCase().replace(" ", "-")}`}
              onClick={() => onDonationClick && onDonationClick(donation._id)}
            >
              <div>
                <strong>{donation.cause || "Donation"}</strong>
              </div>
              <div>
                Amount: <span className="amount">{donation.amount} ETH</span>
              </div>
              <div>
                Status: <span className="status">{donation.status || "Pending"}</span>
              </div>
              <div>Date: {new Date(donation.createdAt).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No donations found.</p>
      )}
    </div>
  )
}

export default DonorDetails

