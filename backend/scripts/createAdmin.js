const mongoose = require("mongoose");
const User = require("../models/User");

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/fyproject", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@example.com",
      password: "admin123", // This will be hashed automatically
      role: "admin",
      phoneNumber: "1234567890",
      aadharNumber: "123456789012",
    });

    // Save admin user
    await adminUser.save();
    console.log("Admin user created successfully");

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminUser();
