"use client"

import { useState, useEffect } from "react"
import { blockchainAPI } from "../../api/api"
import "./BlockchainStatus.css"

const BlockchainStatus = () => {
  const [blockData, setBlockData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setLoading(true)
        const data = await blockchainAPI.getLatestBlock()

        if (data) {
          setBlockData({
            number: data.number || data.blockNumber,
            timestamp: new Date(data.timestamp * 1000).toLocaleString(),
            hash: data.hash,
          })
          setError(null)
        } else {
          setError("Unable to fetch blockchain data.")
        }
      } catch (err) {
        console.error("❌ Failed to fetch latest block:", err)
        setError("Error fetching blockchain data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBlockData()

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchBlockData, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="blockchain-status">
      <h2>Blockchain Status</h2>
      {loading ? (
        <div className="loading-spinner">Loading blockchain data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : blockData ? (
        <div className="block-info">
          <div className="info-item">
            <span className="label">Latest Block:</span>
            <span className="value">{blockData.number}</span>
          </div>
          <div className="info-item">
            <span className="label">Timestamp:</span>
            <span className="value">{blockData.timestamp}</span>
          </div>
          <div className="info-item">
            <span className="label">Hash:</span>
            <span className="value hash">{blockData.hash?.substring(0, 20)}...</span>
          </div>
        </div>
      ) : (
        <div className="no-data">No blockchain data available</div>
      )}
    </div>
  )
}

export default BlockchainStatus
