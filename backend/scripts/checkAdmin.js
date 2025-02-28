const mongoose = require("mongoose");
const User = require("../models/User");

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/fyproject");

    // Find admin user
    const admin = await User.findOne({ email: "admin@example.com" });
    if (admin) {
      console.log("Admin user found:", {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        phoneNumber: admin.phoneNumber,
        aadharNumber: admin.aadharNumber,
      });

      // Check if password validation works
      const isValidPassword = await admin.isValidPassword("admin123");
      console.log(
        "Password validation test:",
        isValidPassword ? "Passed" : "Failed"
      );
    } else {
      console.log("No admin user found");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error checking admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

checkAdminUser();
