// File: models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// First, remove all indexes
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    aadharNumber: {  // Note: This is the correct field name
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v);
        },
        message: "Please enter a valid 12-digit Aadhar number",
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware
userSchema.pre("save", async function (next) {
  // Clean aadharNumber
  if (this.isModified("aadharNumber")) {
    this.aadharNumber = this.aadharNumber.toString().replace(/\s+/g, "").trim();
  }
  
  // Hash password
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

// Create indexes after model is defined
User.collection.dropIndexes().then(() => {
  User.collection.createIndex(
    { aadharNumber: 1 },
    { unique: true, sparse: true, background: true }
  );
  User.collection.createIndex(
    { email: 1 },
    { unique: true, sparse: true, background: true }
  );
  User.collection.createIndex(
    { username: 1 },
    { unique: true, sparse: true, background: true }
  );
}).catch(console.error);

module.exports = User;
