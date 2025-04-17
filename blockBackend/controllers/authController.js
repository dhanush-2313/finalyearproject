const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const { validationResult } = require("express-validator")

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

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (isVerified is true by default)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      isVerified: true, // User is verified by default
    })

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

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const normalizedEmail = email.toLowerCase()
    const user = await User.findOne({ email: normalizedEmail,password })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // const isMatch = await bcrypt.compare(password, user.password)

    // if (!isMatch) {
    //   return res.status(401).json({ error: "Invalid credentials" })
    // }

    // Generate token
    const token = generateToken(user)

    // Return user data and token
    res.json({
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
    console.error(error)
    res.status(500).json({ error: "Error logging in" })
  }
}

// Logout User (Client-side only - just for API completeness)
exports.logout = (req, res) => {
  res.json({ message: "Logged out successfully" })
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
