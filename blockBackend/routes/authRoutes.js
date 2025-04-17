const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const rateLimit = require("express-rate-limit")

// Rate Limiting for Login (Prevents brute-force attacks)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per IP
  message: "Too many login attempts. Try again later.",
})

// User Registration
router.post("/register", authController.register)

// User Login (Protected with Rate Limiting)
router.post("/login", authController.login)

// Logout User
router.post("/logout", authController.logout)

// Get current user (Protected route)
router.get("/me", authMiddleware, authController.getCurrentUser)

module.exports = router
