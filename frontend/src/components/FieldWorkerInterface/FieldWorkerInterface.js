import { useState } from "react"
import "./FieldWorkerInterface.css"
import FieldWorkerTasks from "./FieldWorkerTasks"
import { fieldWorkerAPI } from "../../api/api"

const FieldWorkerInterface = () => {
  const [activeTab, setActiveTab] = useState("tasks") // tasks, updateRefugee, submitAid
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  
  // State for refugee update form
  const [refugeeForm, setRefugeeForm] = useState({
    id: "",
    data: {
      name: "",
      location: "",
      status: "",
      contactInfo: ""
    }
  })
  
  // State for aid report form
  const [aidReportForm, setAidReportForm] = useState({
    refugeeId: "",
    description: "",
    dateProvided: new Date().toISOString().split('T')[0], // Default to today
    type: "",
    quantity: "",
    location: "",
    notes: ""
  })
  
  // Handle refugee form change
  const handleRefugeeFormChange = (e) => {
    const { name, value } = e.target
    if (name === "id") {
      setRefugeeForm({
        ...refugeeForm,
        id: value
      })
    } else {
      setRefugeeForm({
        ...refugeeForm,
        data: {
          ...refugeeForm.data,
          [name]: value
        }
      })
    }
  }
  
  // Handle aid report form change
  const handleAidReportFormChange = (e) => {
    const { name, value } = e.target
    setAidReportForm({
      ...aidReportForm,
      [name]: value
    })
  }
  
  // Submit refugee update
  const handleRefugeeUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      await fieldWorkerAPI.updateRefugeeInfo(refugeeForm)
      setSuccess("Refugee information updated successfully!")
      // Reset form
      setRefugeeForm({
        id: "",
        data: { name: "", location: "", status: "", contactInfo: "" }
      })
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update refugee information")
    } finally {
      setLoading(false)
    }
  }
  
  // Submit aid report
  const handleAidReportSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      // Create a complete description that includes type, quantity, location and notes
      const fullDescription = `${aidReportForm.type} (${aidReportForm.quantity}) - ${aidReportForm.location}${aidReportForm.notes ? ': ' + aidReportForm.notes : ''}`;
      
      // Send only the fields that the backend needs
      const aidData = {
        refugeeId: aidReportForm.refugeeId,
        description: aidReportForm.description || fullDescription, // Use description if provided, otherwise construct it
        dateProvided: aidReportForm.dateProvided,
      };
      
      await fieldWorkerAPI.submitAidReport(aidData);
      setSuccess("Aid report submitted successfully!");
      
      // Reset form
      setAidReportForm({
        refugeeId: "",
        description: "",
        dateProvided: new Date().toISOString().split('T')[0],
        type: "",
        quantity: "",
        location: "",
        notes: ""
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit aid report");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="field-worker-interface">
      <header className="field-worker-header">
        <h1>Field Worker Dashboard</h1>
        <p>Manage your assigned tasks, update refugee information, and submit aid reports.</p>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === "tasks" ? "tab active" : "tab"}
          onClick={() => setActiveTab("tasks")}
        >
          My Tasks
        </button>
        <button 
          className={activeTab === "updateRefugee" ? "tab active" : "tab"}
          onClick={() => setActiveTab("updateRefugee")}
        >
          Update Refugee Info
        </button>
        <button 
          className={activeTab === "submitAid" ? "tab active" : "tab"}
          onClick={() => setActiveTab("submitAid")}
        >
          Submit Aid Report
        </button>
      </div>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <main className="field-worker-main">
        {activeTab === "tasks" && <FieldWorkerTasks />}
        
        {activeTab === "updateRefugee" && (
          <div className="update-refugee-form">
            <h2>Update Refugee Information</h2>
            <form onSubmit={handleRefugeeUpdate}>
              <div className="form-group">
                <label htmlFor="id">Refugee ID</label>
                <input 
                  type="text" 
                  id="id" 
                  name="id" 
                  value={refugeeForm.id}
                  onChange={handleRefugeeFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={refugeeForm.data.name}
                  onChange={handleRefugeeFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={refugeeForm.data.location}
                  onChange={handleRefugeeFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select 
                  id="status" 
                  name="status" 
                  value={refugeeForm.data.status}
                  onChange={handleRefugeeFormChange}
                >
                  <option value="">Select status</option>
                  <option value="Registered">Registered</option>
                  <option value="Verified">Verified</option>
                  <option value="Aid Provided">Aid Provided</option>
                  <option value="Relocated">Relocated</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="contactInfo">Contact Information</label>
                <input 
                  type="text" 
                  id="contactInfo" 
                  name="contactInfo" 
                  value={refugeeForm.data.contactInfo}
                  onChange={handleRefugeeFormChange}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Refugee Info"}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === "submitAid" && (
          <div className="submit-aid-form">
            <h2>Submit Aid Distribution Report</h2>
            <form onSubmit={handleAidReportSubmit}>
              <div className="form-group">
                <label htmlFor="refugeeId">Refugee ID</label>
                <input 
                  type="text" 
                  id="refugeeId" 
                  name="refugeeId" 
                  value={aidReportForm.refugeeId}
                  onChange={handleAidReportFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description" 
                  value={aidReportForm.description}
                  onChange={handleAidReportFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="dateProvided">Date Provided</label>
                <input 
                  type="date" 
                  id="dateProvided" 
                  name="dateProvided" 
                  value={aidReportForm.dateProvided}
                  onChange={handleAidReportFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Aid Type</label>
                <select 
                  id="type" 
                  name="type" 
                  value={aidReportForm.type}
                  onChange={handleAidReportFormChange}
                  required
                >
                  <option value="">Select aid type</option>
                  <option value="Food">Food</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Cash Assistance">Cash Assistance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input 
                  type="number" 
                  id="quantity" 
                  name="quantity" 
                  value={aidReportForm.quantity}
                  onChange={handleAidReportFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Distribution Location</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={aidReportForm.location}
                  onChange={handleAidReportFormChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  value={aidReportForm.notes}
                  onChange={handleAidReportFormChange}
                  rows="4"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Aid Report"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default FieldWorkerInterface

