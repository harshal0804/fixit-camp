const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt"); // To hash passwords
const User = require("../models/User");
const router = express.Router();

// Passport Local Strategy for Login
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Use 'email' as the username field
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, {
            message: "No user with this email found.",
          });
        }
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user); // Authentication successful
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Passport serialization (store user ID in the session)
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id); // Save the user ID to the session
});

// Passport deserialization (retrieve user details from the session)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Retrieve user from the database
    if (user) {
      console.log("Deserialized user:", user);
      done(null, user); // Pass the user object to req.user
    } else {
      done(null, false); // No user found
    }
  } catch (err) {
    console.error("Error during deserialization:", err);
    done(err, null);
  }
});

// Middleware to ensure user is authenticated (for protected routes)
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware/route
  }
  res.status(401).json({ message: "You need to log in first." }); // If not authenticated, respond with 401
}

// Register route
router.post("/register", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { username, phoneNumber, aadharNumber, email, password, role } =
      req.body;

    // Input validation checks
    if (!username || !phoneNumber || !aadharNumber || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create new user with role defaulting to "user" if not specified
    const newUser = new User({
      username,
      phoneNumber,
      aadharNumber,
      email,
      password,
      role: role || "user", // Make role optional, default to "user"
    });

    // Save new user to the database
    await newUser.save();
    console.log("User registered successfully");

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error in registration process:", err);
    if (err.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        message: `A user with this ${field} already exists.`,
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        error: err.message,
      });
    }
    return res.status(500).json({
      message: "Error registering user.",
      error: err.message,
    });
  }
});

// Login route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Authentication error.", error: err.message });
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Invalid credentials." });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error logging in.", error: err.message });
      }
      res.status(200).json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});

// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out." });
    }
    res.status(200).json({ message: "Logged out successfully." });
  });
});

// Profile route (Protected route, requires authentication)
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.status(200).json({
    user: {
      username: req.user.username,
      phoneNumber: req.user.phoneNumber,
      aadharNumber: req.user.aadharNumber,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Admin route (Protected route, requires admin role)
router.get("/admin", ensureAuthenticated, (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. You are not an admin." });
  }
  res.status(200).json({ message: "Welcome, Admin!" });
});

module.exports = router;
