"use client"

import { Component } from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    console.error("ErrorBoundary caught an error:", error)
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error details:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false }) // Reset error state
    window.location.reload() // Refresh page
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Something went wrong. Please refresh the page.</h2>
          <button onClick={this.handleRetry} style={{ padding: "10px 20px", cursor: "pointer" }}>
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary

