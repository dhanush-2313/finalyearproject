"use client"

import { useState, useEffect, useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../auth/authContext"
import { adminAPI } from "../api/api"
import BlockchainStatus from "../components/BlockchainStatus/BlockchainStatus"
import AidRecords from "../components/AidRecords/AidRecords"
import "./Dashboard.css"

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAidRecords: 0,
    activeFieldWorkers: 0,
    registeredRefugees: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only fetch stats if user is authenticated
    if (isAuthenticated) {
      fetchDashboardStats()
    }
  }, [isAuthenticated])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // For admin, fetch from API
      if (user?.role === "admin") {
        try {
          const data = await adminAPI.getDashboardStats()
          setStats({
            totalDonations: data.totalDonations || 0,
            totalAidRecords: data.totalAidRecords || 0,
            activeFieldWorkers: data.activeFieldWorkers || 0,
            registeredRefugees: data.registeredRefugees || 0,
          })
        } catch (err) {
          console.error("Error fetching admin stats:", err)
          // Fall back to mock data
          setMockStats()
        }
      } else {
        // For non-admin users, use mock data
        setMockStats()
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")
      setMockStats()
    } finally {
      setLoading(false)
    }
  }

  const setMockStats = () => {
    // Mock data for demonstration
    setStats({
      totalDonations: 15420,
      totalAidRecords: 256,
      activeFieldWorkers: 42,
      registeredRefugees: 1250,
    })
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="welcome-message">Welcome, {user?.name || "User"}!</p>

      {loading ? (
        <div className="loading-container">Loading dashboard data...</div>
      ) : error ? (
        <div className="error-container">{error}</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Donations</h3>
              <p className="stat-value">${stats.totalDonations.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Aid Records</h3>
              <p className="stat-value">{stats.totalAidRecords}</p>
            </div>
            <div className="stat-card">
              <h3>Field Workers</h3>
              <p className="stat-value">{stats.activeFieldWorkers}</p>
            </div>
            <div className="stat-card">
              <h3>Registered Refugees</h3>
              <p className="stat-value">{stats.registeredRefugees}</p>
            </div>
          </div>

          {user?.role === "admin" && (
            <div className="admin-section">
              <h2>Admin Controls</h2>
              <div className="admin-controls">
                <button onClick={() => alert("Manage Users functionality coming soon!")}>Manage Users</button>
                <button onClick={() => alert("System Settings functionality coming soon!")}>System Settings</button>
                <button onClick={() => alert("View Reports functionality coming soon!")}>View Reports</button>
              </div>
            </div>
          )}

          <div className="dashboard-sections">
            <div className="section">
              <BlockchainStatus />
            </div>
            <div className="section">
              <AidRecords />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
