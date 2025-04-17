"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../auth/authContext"
import FieldWorkerInterface from "../components/FieldWorkerInterface/FieldWorkerInterface"
import "./FieldWorker.css"

const FieldWorker = () => {
  const { isAuthenticated, user } = useContext(AuthContext)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check if user is a field worker
  if (user?.role !== "fieldWorker") {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="field-worker-page">
      <h1>Field Worker Dashboard</h1>
      <p className="field-worker-description">Manage your assigned tasks and update refugee information</p>
      <FieldWorkerInterface />
    </div>
  )
}

export default FieldWorker
