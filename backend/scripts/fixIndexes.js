const mongoose = require("mongoose");
const User = require("../models/User");

async function fixIndexes() {
  try {
    // Connect to your database
    await mongoose.connect("mongodb://localhost:27017/auth_example");

    // Drop all indexes
    await User.collection.dropIndexes();
    console.log("Dropped all indexes");

    // Create new indexes
    await User.collection.createIndex(
      { aadharNumber: 1 },
      { unique: true, sparse: true }
    );
    await User.collection.createIndex(
      { email: 1 },
      { unique: true, sparse: true }
    );
    await User.collection.createIndex(
      { username: 1 },
      { unique: true, sparse: true }
    );

    console.log("Created new indexes");

    // List all indexes to verify
    const indexes = await User.collection.indexes();
    console.log("Current indexes:", indexes);

    process.exit(0);
  } catch (error) {
    console.error("Error fixing indexes:", error);
    process.exit(1);
  }
}

fixIndexes();
