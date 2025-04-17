import axios from "axios"

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000/api/aidRecords"

export const addAidRecord = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/add`, data)
    return response.data
  } catch (error) {
    console.error("Error adding aid record:", error)
    return null
  }
}

