"use client"

import { useState, useEffect, useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../auth/authContext"
import { refugeeAPI } from "../api/api"
import "./AidReceived.css"

const AidReceived = () => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const [aidRecords, setAidRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchAidRecords = async () => {
      try {
        setLoading(true)
        const response = await refugeeAPI.getAidReceived()
        if (isMounted) {
          setAidRecords(response.data)
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching aid records:", err)
        setError("Failed to load aid records. Please try again later.")
        // Set mock data for demonstration
        if (isMounted) {
          setAidRecords([
            {
              id: 1,
              type: "Food Supplies",
              amount: 100,
              date: "2023-04-10",
              status: "Delivered",
            },
            {
              id: 2,
              type: "Medical Supplies",
              amount: 50,
              date: "2023-04-12",
              status: "In Transit",
            },
            {
              id: 3,
              type: "Shelter Materials",
              amount: 200,
              date: "2023-04-15",
              status: "Pending",
            },
          ])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAidRecords()

    return () => {
      isMounted = false
    }
  }, [])

  // Move conditional returns AFTER all hooks
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (user?.role !== "refugee") {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="aid-received-page">
      <h1>Aid Received</h1>
      <p className="aid-received-description">Track the aid packages allocated to you</p>

      {loading ? (
        <div className="loading">Loading aid records...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="aid-records-list">
          <h2>Your Aid Records</h2>
          {aidRecords.length > 0 ? (
            <table className="aid-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {aidRecords.map((record) => (
                  <tr key={record.id} className={`status-${record.status.toLowerCase().replace(" ", "-")}`}>
                    <td>{record.id}</td>
                    <td>{record.type}</td>
                    <td>${record.amount}</td>
                    <td>{record.date}</td>
                    <td>{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-records">No aid records found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default AidReceived
