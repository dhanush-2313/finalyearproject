"use client"

import React from "react"
import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../auth/authContext"
import ConnectWallet from "../connectWallet/ConnectWallet1"
import { useToast } from "@chakra-ui/react"
import "./Navbar.css"

const Navbar = ({ account, connectWallet }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      
      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      })
      
      navigate("/")
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      })
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">AidForge</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user?.role === "admin" && <Link to="/admin">Admin</Link>}
            {user?.role === "fieldWorker" && <Link to="/field-worker">Field Work</Link>}
            {user?.role === "donor" && <Link to="/donations">My Donations</Link>}
            {user?.role === "refugee" && <Link to="/aid-received">Aid Received</Link>}
            <Link to="/files">Documents</Link>
            <Link to="/account-settings">Account Settings</Link>
          </>
        ) : (
          <>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-name">Welcome, {user?.name}</span>
            <Link to="/account-settings" className="account-settings-btn">
              Settings
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
          </div>
        )}

        <ConnectWallet account={account} connectWallet={connectWallet} />
      </div>
    </nav>
  )
}

export default Navbar
