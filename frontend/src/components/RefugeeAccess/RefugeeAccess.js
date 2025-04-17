"use client"

import { useEffect, useState } from "react"
import RefugeeProfile from "./RefugeeProfile"
import "./RefugeeAccess.css"
import { fetchRefugeeData, updateRefugeeData } from "../../api/api"

const RefugeeAccess = () => {
  const [refugeeData, setRefugeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRefugeeData()
        setRefugeeData(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load refugee data.")
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpdate = async (updatedData) => {
    try {
      const response = await updateRefugeeData(updatedData)
      setRefugeeData(response)
      alert("Profile updated successfully.")
    } catch (err) {
      alert("Failed to update profile.")
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="refugee-access">
      <h1>Refugee Access</h1>
      <RefugeeProfile data={refugeeData} onUpdate={handleUpdate} />
    </div>
  )
}

export default RefugeeAccess

