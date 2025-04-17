"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../auth/authContext"
import "./AidRecords.css"

const AidRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    recipient: "",
    aidType: "",
    amount: "",
  })
  const { isAuthenticated, role } = useContext(AuthContext)

  useEffect(() => {
    fetchAidRecords()
  }, [])

  const fetchAidRecords = async () => {
    try {
      setLoading(true)
      // In a real app, we would fetch from the backend
      // For now, we'll use mock data
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

    if (role !== "admin" && role !== "fieldWorker") {
      setError("You don't have permission to add records")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // In a real app, we would call the API
      // await blockchainAPI.addAidRecord(
      //   formData.recipient,
      //   formData.aidType,
      //   formData.amount
      // );

      // For now, we'll just add to the local state
      const newRecord = {
        id: records.length + 1,
        ...formData,
        status: "Pending",
        timestamp: new Date().toLocaleString(),
      }

      setRecords([...records, newRecord])

      // Reset form
      setFormData({
        recipient: "",
        aidType: "",
        amount: "",
      })

      alert("Aid record added successfully!")
    } catch (err) {
      console.error("Error adding aid record:", err)
      setError("Error adding aid record. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="aid-records">
      <h2>Aid Records</h2>

      {isAuthenticated && (role === "admin" || role === "fieldWorker") && (
        <form onSubmit={handleSubmit} className="aid-form">
          <h3>Add New Aid Record</h3>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="recipient">Recipient</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="aidType">Aid Type</label>
            <input
              type="text"
              id="aidType"
              name="aidType"
              value={formData.aidType}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Record"}
          </button>
        </form>
      )}

      <div className="records-list">
        <h3>Recent Records</h3>

        {loading ? (
          <div className="loading">Loading records...</div>
        ) : records.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Aid Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className={`status-${record.status.toLowerCase().replace(" ", "-")}`}>
                  <td>{record.id}</td>
                  <td>{record.recipient}</td>
                  <td>{record.aidType}</td>
                  <td>{record.amount}</td>
                  <td>{record.status}</td>
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
