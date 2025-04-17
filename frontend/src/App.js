"use client"

import { useEffect, useState, Suspense, lazy, useContext } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar/Navbar"
import Footer from "./components/Footer/Footer"
import ErrorBoundary from "./components/ErrorBoundary"
import { initializeEthers } from "./utils/contract"
import { AuthProvider, AuthContext } from "./auth/authContext"
import Loader from "./components/Loader/Loader"

// Lazy-loaded pages for better performance
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/Signup"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Donations = lazy(() => import("./pages/Donations"))
const Admin = lazy(() => import("./pages/Admin"))
const FieldWorker = lazy(() => import("./pages/FieldWorker"))
const AidReceived = lazy(() => import("./pages/AidReceived"))

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

const App = () => {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        console.log("✅ MetaMask detected!")

        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          console.log("🔗 Connected to chain:", chainId)
        } catch (error) {
          console.error("❌ Error fetching chain ID:", error)
        }

        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0])
            localStorage.setItem("connectedAccount", accounts[0])
          } else {
            setAccount(null)
            localStorage.removeItem("connectedAccount")
          }
        })

        window.ethereum.on("chainChanged", () => window.location.reload())
      } else {
        console.warn("⚠️ MetaMask not detected! Please install it.")
      }
    }

    const loadConnectedWallet = () => {
      const savedAccount = localStorage.getItem("connectedAccount")
      if (savedAccount) {
        setAccount(savedAccount)
      }
    }

    checkMetaMask()
    initializeEthers()
    loadConnectedWallet()
  }, [])

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
        localStorage.setItem("connectedAccount", accounts[0])
      } catch (error) {
        console.error("❌ Wallet connection failed:", error)
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to continue.")
    }
  }

  return (
    <AuthProvider>
      <Router>
        <Navbar account={account} connectWallet={connectWallet} />
        <Suspense fallback={<Loader />}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donations"
                element={
                  <ProtectedRoute>
                    <Donations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/field-worker"
                element={
                  <ProtectedRoute>
                    <FieldWorker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aid-received"
                element={
                  <ProtectedRoute>
                    <AidReceived />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
