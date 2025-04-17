"use client"

import { useEffect, useState } from "react"
import "./AdminDashboard.css"
import { fetchDashboardData } from "../../api/api"
import { FaUsers, FaUserShield, FaHandHoldingHeart, FaDonate } from "react-icons/fa"
import Loader from "../Loader" // Assuming you have a Loader component

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalDonors: 0,
    totalRefugees: 0,
    totalFieldWorkers: 0,
    totalDonations: 0,
    loading: true,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData()
        setDashboardData({
          totalDonors: data.donors,
          totalRefugees: data.refugees,
          totalFieldWorkers: data.fieldWorkers,
          totalDonations: data.donations,
          loading: false,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setDashboardData((prevState) => ({ ...prevState, loading: false }))
      }
    }

    loadData()
  }, [])

  if (dashboardData.loading) {
    return <Loader /> // Use a spinner or custom loader
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-overview">
        <div className="dashboard-card">
          <FaUsers size={40} color="#3498db" />
          <h3>Total Donors</h3>
          <p>{dashboardData.totalDonors}</p>
        </div>
        <div className="dashboard-card">
          <FaUserShield size={40} color="#e74c3c" />
          <h3>Total Refugees</h3>
          <p>{dashboardData.totalRefugees}</p>
        </div>
        <div className="dashboard-card">
          <FaHandHoldingHeart size={40} color="#2ecc71" />
          <h3>Total Field Workers</h3>
          <p>{dashboardData.totalFieldWorkers}</p>
        </div>
        <div className="dashboard-card">
          <FaDonate size={40} color="#9b59b6" />
          <h3>Total Donations</h3>
          <p>${dashboardData.totalDonations}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

