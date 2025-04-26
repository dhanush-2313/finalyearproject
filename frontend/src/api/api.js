import axios from "axios"

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // Increased timeout to 2 minutes for blockchain transactions
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
    
    // Add retry configuration for blockchain endpoints
    if (config.url.includes('/blockchain/')) {
      config.retry = 3;
      config.retryDelay = 1000;
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle token expiration and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // If the error is due to timeout and we haven't retried yet
    if (error.code === 'ECONNABORTED' && config.retry) {
      config.retry -= 1;
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      return api(config);
    }
    
    if (response && response.status === 401) {
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
  logout: () => {
    localStorage.removeItem("token");
    return api.post("/auth/logout").finally(() => {
      window.location.href = "/login";
    });
  },
  getCurrentUser: () => api.get("/auth/me"),
}

// Blockchain API
export const blockchainAPI = {
  getLatestBlock: () => api.get("/blockchain/latest-block"),
  getAidRecords: () => api.get("/blockchain/aid"),
  addAidRecord: (data) => api.post("/blockchain/aid", data),
  updateAidStatus: (id, status) => api.put(`/blockchain/aid/${id}`, { status }),
  // New address resolution methods
  resolveAddress: (address) => api.get(`/blockchain/resolve/address/${address}`),
  resolveMultipleAddresses: (addresses) => api.post("/blockchain/resolve/addresses", { addresses }),
  getEnhancedAidRecords: () => api.get("/blockchain/enhanced-aid-records"),
  // Added functions for Admin dashboard
  getRecentEvents: () => api.get("/blockchain/events/recent"),
  getAidStats: () => api.get("/blockchain/stats/aid"),
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
  // Added functions for Admin dashboard
  getUserStats: () => api.get("/admin/stats/users"),
  getUsers: () => api.get("/admin/users"),
  getDonationStats: () => api.get("/admin/stats/donations"),
  getAllDonations: () => api.get("/admin/donations"),
  getLogs: () => api.get("/admin/activity-logs"),
  createUser: (userData) => api.post("/admin/users", userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

export default api
