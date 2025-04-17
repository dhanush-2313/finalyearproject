"use client"

import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../auth/authContext"
import DonorDetails from "../components/DonorTracking/DonorDetails"
import { donorAPI } from "../api/api"
import "./Donations.css"

const Donations = () => {
  const { isAuthenticated, user } = useContext(AuthContext)

  // State for donation form
  const [donationForm, setDonationForm] = useState({
    amount: "",
    cause: "",
  })
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  // State for tracking a specific donation
  const [trackingId, setTrackingId] = useState("")
  const [trackedDonation, setTrackedDonation] = useState(null)
  const [trackingError, setTrackingError] = useState("")
  const [trackingLoading, setTrackingLoading] = useState(false)

  // State for tab navigation
  const [activeTab, setActiveTab] = useState("list") // 'list', 'make', 'track'

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check if user is a donor
  if (user?.role !== "donor") {
    return <Navigate to="/dashboard" />
  }

  // Handle form change
  const handleFormChange = (e) => {
    setDonationForm({
      ...donationForm,
      [e.target.name]: e.target.value,
    })
  }

  // Handle donation submission
  const handleDonationSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    setFormSuccess("")

    // Validate form
    if (!donationForm.amount || isNaN(donationForm.amount) || !donationForm.cause) {
      setFormError("Please enter a valid amount and cause")
      setFormLoading(false)
      return
    }

    try {
      await donorAPI.makeDonation({
        amount: Number.parseFloat(donationForm.amount),
        cause: donationForm.cause,
      })
      setFormSuccess("Donation submitted successfully!")
      setDonationForm({ amount: "", cause: "" }) // Clear form

      // After 2 seconds, go back to the list view to see the updated list
      setTimeout(() => {
        setActiveTab("list")
        setFormSuccess("")
      }, 2000)
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to submit donation. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  // Handle tracking a donation
  const handleTrackDonation = async (e) => {
    e.preventDefault()
    setTrackingLoading(true)
    setTrackingError("")
    setTrackedDonation(null)

    if (!trackingId) {
      setTrackingError("Please enter a donation ID")
      setTrackingLoading(false)
      return
    }

    try {
      const response = await donorAPI.trackDonation(trackingId)
      setTrackedDonation(response.data)
    } catch (err) {
      setTrackingError(err.response?.data?.error || "Failed to track donation. Please check the ID and try again.")
    } finally {
      setTrackingLoading(false)
    }
  }

  // Handle clicking on a donation to track it
  const handleDonationClick = (donationId) => {
    setTrackingId(donationId)
    setActiveTab("track")
  }

  return (
    <div className="page-container donations-page">
      <h1>Donations</h1>
      <p className="page-description">Manage and track your contributions to refugees</p>

      {/* Tab navigation */}
      <div className="tabs">
        <div className={`tab ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
          View Donations
        </div>
        <div className={`tab ${activeTab === "make" ? "active" : ""}`} onClick={() => setActiveTab("make")}>
          Make New Donation
        </div>
        <div className={`tab ${activeTab === "track" ? "active" : ""}`} onClick={() => setActiveTab("track")}>
          Track Donation
        </div>
      </div>

      {/* View Donations Tab */}
      {activeTab === "list" && (
        <div className="donations-content">
          <DonorDetails onDonationClick={handleDonationClick} />
        </div>
      )}

      {/* Make Donation Tab */}
      {activeTab === "make" && (
        <div className="donation-form">
          <h2>Make a Donation</h2>
          {formError && <div className="error">{formError}</div>}
          {formSuccess && <div className="success-message">{formSuccess}</div>}

          <form onSubmit={handleDonationSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-control"
                value={donationForm.amount}
                onChange={handleFormChange}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cause">Cause</label>
              <select
                id="cause"
                name="cause"
                className="form-control"
                value={donationForm.cause}
                onChange={handleFormChange}
                required
              >
                <option value="">Select a cause</option>
                <option value="Food Aid">Food Aid</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Education">Education</option>
                <option value="Shelter">Shelter</option>
                <option value="Emergency Relief">Emergency Relief</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? "Processing..." : "Make Donation"}
            </button>
          </form>
        </div>
      )}

      {/* Track Donation Tab */}
      {activeTab === "track" && (
        <div className="donation-form">
          <h2>Track Donation</h2>
          {trackingError && <div className="error">{trackingError}</div>}

          <form onSubmit={handleTrackDonation}>
            <div className="form-group">
              <label htmlFor="trackingId">Donation ID</label>
              <input
                type="text"
                id="trackingId"
                name="trackingId"
                className="form-control"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter donation ID"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={trackingLoading}>
              {trackingLoading ? "Tracking..." : "Track Donation"}
            </button>
          </form>

          {trackedDonation && (
            <div className="donation-details">
              <h3>Donation Details</h3>
              <div className="donation-info">
                <div className="info-item">
                  <p>
                    <span>Cause:</span> {trackedDonation.cause}
                  </p>
                </div>
                <div className="info-item">
                  <p>
                    <span>Amount:</span> ${trackedDonation.amount}
                  </p>
                </div>
                <div className="info-item">
                  <p>
                    <span>Status:</span> {trackedDonation.status || "Pending"}
                  </p>
                </div>
                <div className="info-item">
                  <p>
                    <span>Date:</span> {new Date(trackedDonation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {trackedDonation.updatedAt && (
                  <div className="info-item">
                    <p>
                      <span>Last Updated:</span> {new Date(trackedDonation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Donations
