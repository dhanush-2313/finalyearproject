"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"

// Create auth context
export const AuthContext = createContext()

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api"

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  })

  // Check if user is already logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        })
        return
      }

      try {
        // Set auth token in headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Get user data
        const res = await axios.get(`${API_URL}/auth/me`)

        setAuthState({
          isAuthenticated: true,
          user: res.data,
          token,
          loading: false,
          error: null,
        })
      } catch (err) {
        // If token is invalid, clear localStorage
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]

        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        })
      }
    }

    loadUser()
  }, [])

  // Register user
  const register = async (formData) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const res = await axios.post(`${API_URL}/auth/register`, formData)

      // Save token to localStorage
      localStorage.setItem("token", res.data.token)

      // Set auth token in headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`

      setAuthState({
        isAuthenticated: true,
        user: res.data.user,
        token: res.data.token,
        loading: false,
        error: null,
      })

      return res.data
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.error || "Registration failed",
      }))

      throw err
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      const token = res.data.token
      
      // Save token to localStorage
      localStorage.setItem("token", token)

      // Important: Set auth token in axios defaults for ALL future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      
      setAuthState({
        isAuthenticated: true,
        user: res.data.user,
        token: token,
        loading: false,
        error: null,
      })

      return res.data
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.error || "Login failed",
      }))

      throw err
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`)
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Remove token from localStorage
      localStorage.removeItem("token")

      // Remove auth token from headers
      delete axios.defaults.headers.common["Authorization"]

      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
