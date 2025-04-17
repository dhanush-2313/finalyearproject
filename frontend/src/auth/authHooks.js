"use client"

import { useContext } from "react"
import { AuthContext } from "./authContext"

// Custom hook to get the authentication state
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

