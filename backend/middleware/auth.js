const Admin = require("../models/Admin");

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  console.log("Session:", req.session); // Log the session
  console.log("User:", req.user); // Log the user object

  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return next(); // User is authenticated and is an admin, proceed to the next route
    } else {
      return res.status(403).json({ message: "Forbidden: You are not an admin." });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized: Please login first." });
  }
}


module.exports = {
  ensureAuthenticated,
  ensureAdmin,
};
