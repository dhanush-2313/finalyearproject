"use client"

import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../auth/authContext"
import ConnectWallet from "../connectWallet/ConnectWallet1"
import "./Navbar.css"

const Navbar = ({ account, connectWallet }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
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
