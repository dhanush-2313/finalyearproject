const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "fieldWorker", "donor", "refugee"], required: true },
    isVerified: { type: Boolean, default: true }, // Always true by default
    mfaEnabled: { type: Boolean, default: false }, // Add missing MFA field
    mfaSecret: { type: String }, // Secret for MFA
    walletAddress: { type: String, sparse: true }, // Blockchain wallet address
    profileDetails: { // Additional profile information
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
  },
  { timestamps: true },
)

// Index on wallet address for efficient lookups
userSchema.index({ walletAddress: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

module.exports = mongoose.model("User", userSchema)