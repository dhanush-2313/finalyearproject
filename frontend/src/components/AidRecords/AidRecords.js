"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../auth/authContext"
import { blockchainAPI } from "../../api/api"
import "./AidRecords.css"

const AidRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    recipient: "",
    aidType: "",
    amount: "0.1", // Default to 0.1 ETH
  })
  const { isAuthenticated, user } = useContext(AuthContext)

  useEffect(() => {
    fetchAidRecords()
  }, [])

  const fetchAidRecords = async () => {
    try {
      setLoading(true)
      // Fetch real data from the blockchain API
      const response = await blockchainAPI.getAidRecords()
      
      if (response && response.data && response.data.success) {
        setRecords(response.data.records || [])
      } else {
        // Fallback to mock data if API call fails
        const mockData = [
          {
            id: 1,
            recipient: "Refugee Camp Alpha",
            aidType: "Food Supplies",
            amount: 1000,
            status: "Delivered",
            timestamp: new Date().toLocaleString(),
          },
          {
            id: 2,
            recipient: "Medical Center Beta",
            aidType: "Medical Supplies",
            amount: 500,
            status: "In Transit",
            timestamp: new Date(Date.now() - 86400000).toLocaleString(),
          },
        ]
        setRecords(mockData)
      }
      
      setError(null)
    } catch (err) {
      console.error("Error fetching aid records:", err)
      setError("Failed to load aid records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setError("You must be logged in to add records")
      return
    }

    if (user?.role !== "admin" && user?.role !== "fieldWorker") {
      setError("You don't have permission to add records")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Real API call to the blockchain backend
      const response = await blockchainAPI.addAidRecord({
        recipient: formData.recipient,
        aidType: formData.aidType,
        amount: formData.amount,
      })

      if (response && response.data && response.data.success) {
        // Refresh the records list
        fetchAidRecords()
        
        // Reset form
        setFormData({
          recipient: "",
          aidType: "",
          amount: "0.1",
        })

        alert("Aid record added successfully!")
      } else {
        throw new Error(response?.data?.error || "Failed to add aid record")
      }
    } catch (err) {
      console.error("Error adding aid record:", err)
      setError(`Error adding aid record: ${err.message || "Please try again."}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="aid-records">
      <h2>Aid Records</h2>

      {isAuthenticated && (user?.role === "admin" || user?.role === "fieldWorker") && (
        <form onSubmit={handleSubmit} className="aid-form">
          <h3>Add New Aid Record</h3>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              placeholder="0x..."
              value={formData.recipient}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <small>Enter the Ethereum address of the recipient</small>
          </div>

          <div className="form-group">
            <label htmlFor="aidType">Aid Description</label>
            <input
              type="text"
              id="aidType"
              name="aidType"
              placeholder="Food supplies, Medicine, etc."
              value={formData.aidType}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (ETH)</label>
            <input
              type="text"
              id="amount"
              name="amount"
              placeholder="0.1"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <small>Amount of ETH to allocate for this aid package</small>
          </div>

          <button type="submit" disabled={submitting} className="submit-button">
            {submitting ? "Adding..." : "Add Record"}
          </button>
        </form>
      )}

      <div className="records-list">
        <h3>Recent Records</h3>
        <button onClick={fetchAidRecords} className="refresh-button" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        {loading ? (
          <div className="loading">Loading records...</div>
        ) : records.length > 0 ? (
          <table className="records-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className={`status-${record.status?.toLowerCase()?.replace(" ", "-") || "pending"}`}>
                  <td>{record.id}</td>
                  <td className="address-cell" title={record.recipient}>
                    {record.recipient?.substr(0, 6)}...{record.recipient?.substr(-4)}
                  </td>
                  <td>{record.aidType}</td>
                  <td>{typeof record.amount === 'number' ? record.amount : Number(record.amount) / 1e18} ETH</td>
                  <td>{record.status || "Pending"}</td>
                  <td>{record.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-records">No records found</p>
        )}
      </div>
    </div>
  )
}

export default AidRecords
