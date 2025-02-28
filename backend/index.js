const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("./config/passport");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const Admin = require("./models/Admin");
const User = require("./models/User");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const port = 3000;

const app = express();

// MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/test1"; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// CORS configuration for cross-origin requests
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://192.168.144.68:3001",
      "http://192.168.144.68:3000",
    ],
    credentials: true, // Allow credentials in requests
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Middleware configuration for parsing JSON and form data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Session middleware setup
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
     
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes configuration
app.use("/admin", adminRoutes); // Admin routes
app.use("/auth", authRoutes); // Authentication routes
app.use("/auth/posts", postRoutes); // Post routes
app.use("/auth/users", userRoutes); // User routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack); // Enhanced error logging
  res.status(500).json({
    message: "Something broke! Please try again later.",
    error: err.message,
  });
});

// 404 Error handling for undefined routes
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url); // Detailed logging for 404s
  res.status(404).json({
    message: "Route not found",
    path: req.url,
    method: req.method,
  });
});

// Start server and log the port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
