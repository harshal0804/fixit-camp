const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, aadharNumber, phoneNumber } = req.body;

    console.log("Registration attempt:", {
      username,
      email,
      aadharNumber,
      phoneNumber,
    });

    // Validate Aadhar format
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        message: "Please provide a valid 12-digit Aadhar number",
      });
    }

    // In your registration route, add this validation
    const cleanAadhar = aadharNumber.toString().replace(/\s+/g, "").trim();
    if (cleanAadhar !== aadharNumber) {
      console.log(
        `Cleaned Aadhar number from "${aadharNumber}" to "${cleanAadhar}"`
      );
    }

    // Check for existing Aadhar with cleaned version
    const existingAadhar = await User.findOne({
      aadharNumber: cleanAadhar,
    });

    if (existingAadhar) {
      console.log("Found existing Aadhar:", {
        searched: cleanAadhar,
        found: existingAadhar.aadharNumber,
        userId: existingAadhar._id,
      });
      return res.status(400).json({
        message: "Aadhar number already registered",
        debug: {
          searched: cleanAadhar,
          found: existingAadhar.aadharNumber,
        },
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      aadharNumber,
      phoneNumber,
    });

    console.log("Attempting to save user:", user);

    await user.save();
    console.log("User saved successfully");

    // Log in the user after registration
    req.login(user, (err) => {
      if (err) {
        console.error("Login error after registration:", err);
        return res.status(500).json({
          message: "Error logging in after registration",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Registration successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log("Duplicate key error:", error.keyPattern);
      return res.status(400).json({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
        field: field,
      });
    }

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
      details: error.stack,
    });
  }
});

// Temporary debug route - remove in production
router.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({}).select("username email aadharNumber");
    console.log("Current users:", users);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add this route to check specific aadhar number
router.get("/debug/check-aadhar/:aadharNumber", async (req, res) => {
  try {
    const { aadharNumber } = req.params;
    const user = await User.findOne({ aadharNumber });
    console.log(`Checking aadhar ${aadharNumber}:`, user);
    res.json({ exists: !!user, user });
  } catch (error) {
    console.error("Error checking aadhar:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add this debug route to check and clean Aadhar numbers
router.get("/debug/aadhar-check/:aadharNumber", async (req, res) => {
  try {
    const { aadharNumber } = req.params;

    // Find all users with similar Aadhar numbers (including with spaces)
    const users = await User.find({
      $or: [
        { aadharNumber: aadharNumber },
        { aadharNumber: new RegExp(aadharNumber.split("").join("\\s*")) },
      ],
    });

    console.log(`Debug: Checking Aadhar ${aadharNumber}`);
    console.log("Found users:", users);

    // Return detailed information
    res.json({
      searchedAadhar: aadharNumber,
      usersFound: users.map((u) => ({
        id: u._id,
        username: u.username,
        aadharNumber: u.aadharNumber,
        aadharLength: u.aadharNumber?.length,
        hasSpaces: /\s/.test(u.aadharNumber),
      })),
    });
  } catch (error) {
    console.error("Debug Aadhar check error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add a cleanup route if needed
router.post("/debug/cleanup-aadhar", async (req, res) => {
  try {
    const users = await User.find({});
    let updates = 0;

    for (const user of users) {
      if (user.aadharNumber) {
        const cleaned = user.aadharNumber.replace(/\s+/g, "").trim();
        if (cleaned !== user.aadharNumber) {
          user.aadharNumber = cleaned;
          await user.save();
          updates++;
        }
      }
    }

    res.json({ message: `Cleaned up ${updates} users` });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
