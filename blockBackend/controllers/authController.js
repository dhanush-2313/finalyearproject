const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt") // Changed from bcryptjs to bcrypt to match User model
const User = require("../models/User")
const { validationResult } = require("express-validator")
const monitoring = require("../utils/monitoring")

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }, // Token valid for 7 days
  )
}

// Register User (No Email Verification)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Validate input
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Check valid roles
    const validRoles = ["admin", "fieldWorker", "donor", "refugee"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${validRoles.join(", ")}` })
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" })
    }

    // Create user (password will be hashed by the User model's pre-save middleware)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      isVerified: true, // User is verified by default
    })

    // Track registration in metrics
    monitoring.metrics.userRegistrationsTotal.inc({ role: user.role })

    // Generate token
    const token = generateToken(user)

    // Return user data and token
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error registering user" })
  }
}

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log(`Login attempt for email: ${email}, ${password}`); // Add logging for debugging

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const normalizedEmail = email.toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      console.log(`User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid credentials" })
    }

    console.log(`Found user: ${user.name}, role: ${user.role}`);

    // Use the User model's comparePassword method
    // const isMatch = await user.comparePassword(password)
    if(user.password === password) {
      var isMatch = true
    }

    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if MFA is enabled for this user
    if (user.mfaEnabled) {
      return res.status(200).json({
        requireMFA: true,
        userId: user.id,
        message: "MFA verification required",
      })
    }

    // Update active users count
    monitoring.metrics.activeUsers.inc()

    // Generate token
    const token = generateToken(user)
    
    // Store token in invalidated tokens list (if we implement token tracking)
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Error during login" })
  }
}

// Logout User
exports.logout = async (req, res) => {
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(400).json({ message: "No token provided" })
    }
    
    // In a production environment, you would add the token to a blacklist
    // For example, in Redis or a database table of invalidated tokens
    // For now, we'll just acknowledge the logout
    
    // Decrement active users count in monitoring
    monitoring.metrics.activeUsers.dec()
    
    // Send successful response
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Error during logout" })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}
