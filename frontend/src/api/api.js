import axios from "axios"

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
}

// Blockchain API
export const blockchainAPI = {
  getLatestBlock: () => api.get("/blockchain/latest-block"),
  getAidRecords: () => api.get("/blockchain/aid-records"),
  addAidRecord: (data) => api.post("/blockchain/aid", data),
  updateAidStatus: (id, status) => api.put(`/blockchain/aid/${id}`, { status }),
}

// Donor API
export const donorAPI = {
  getDonations: () => api.get("/donors/view-donations"),
  makeDonation: (data) => api.post("/donors/make-donation", data),
  trackDonation: (id) => api.get(`/donors/track-donation/${id}`),
}

// Refugee API
export const refugeeAPI = {
  getProfile: () => api.get("/refugees/profile"),
  getAidReceived: () => api.get("/refugees/aid-received"),
  updateProfile: (data) => api.put("/refugees/update-profile", data),
}

// Field Worker API
export const fieldWorkerAPI = {
  getAssignedTasks: () => api.get("/field-worker/assigned-tasks"),
  updateRefugeeInfo: (data) => api.post("/field-worker/update-refugee-info", data),
  submitAidReport: (data) => api.post("/field-worker/submit-aid-report", data),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  createFieldWorker: (data) => api.post("/admin/create-fieldworker", data),
  deleteFieldWorker: (id) => api.delete(`/admin/delete-fieldworker/${id}`),
  getActivityLogs: () => api.get("/admin/logs"),
}

export default api
