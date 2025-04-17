import { useState, useEffect, useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../auth/authContext"
import "./Admin.css"

const Admin = () => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([]) // Added logs state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("users") // users, logs, settings

  useEffect(() => {
    setLoading(true) // Set loading to true at the beginning of useEffect

    const fetchData = async () => {
      try {
        if (activeTab === "users") {
          // In a real app, we would fetch from the API
          // For now, we'll use mock data
          setTimeout(() => {
            setUsers([
              { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
              { id: 2, name: "Jane Smith", email: "jane@example.com", role: "fieldWorker" },
              { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "donor" },
              { id: 4, name: "Alice Brown", email: "alice@example.com", role: "refugee" },
            ])
            setLoading(false)
          }, 1000)
        } else if (activeTab === "logs") {
          // In a real app, we would fetch from the API
          // For now, we'll use mock data
          setTimeout(() => {
            setLogs([
              { id: 1, action: "User Login", user: "john@example.com", timestamp: "2023-04-15 10:30:45" },
              { id: 2, action: "Donation Added", user: "bob@example.com", timestamp: "2023-04-15 11:20:15" },
              { id: 3, action: "Aid Record Updated", user: "jane@example.com", timestamp: "2023-04-15 12:05:30" },
              { id: 4, action: "User Registered", user: "alice@example.com", timestamp: "2023-04-15 13:45:10" },
            ])
            setLoading(false)
          }, 1000)
        } else {
          setLoading(false) // If it's settings tab, set loading to false immediately
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err)
        setError(`Failed to load ${activeTab}`)
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab])

  // Move conditional returns AFTER all hooks
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <p className="admin-description">Manage users, view logs, and configure system settings</p>

      <div className="admin-tabs">
        <div className={`admin-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          Users
        </div>
        <div className={`admin-tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
          Activity Logs
        </div>
        <div
          className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {activeTab === "users" && (
              <div className="users-section">
                <h2>System Users</h2>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button className="btn-edit">Edit</button>
                          <button className="btn-delete">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="logs-section">
                <h2>Activity Logs</h2>
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.action}</td>
                        <td>{log.user}</td>
                        <td>{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="settings-section">
                <h2>System Settings</h2>
                <form className="settings-form">
                  <div className="form-group">
                    <label htmlFor="siteName">Site Name</label>
                    <input type="text" id="siteName" name="siteName" defaultValue="AidForge" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="adminEmail">Admin Email</label>
                    <input type="email" id="adminEmail" name="adminEmail" defaultValue="admin@aidforge.org" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="blockchainNetwork">Blockchain Network</label>
                    <select id="blockchainNetwork" name="blockchainNetwork" defaultValue="ethereum">
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="binance">Binance Smart Chain</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="maintenanceMode">Maintenance Mode</label>
                    <input type="checkbox" id="maintenanceMode" name="maintenanceMode" />
                  </div>
                  <button type="submit" className="btn-save">
                    Save Settings
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Admin
