const mongoose = require("mongoose");
const User = require("../models/User");

async function resetDatabase() {
  try {
    // Connect to your database
    await mongoose.connect("mongodb://localhost:27017/auth_example");

    // Get the collection
    const collection = User.collection;

    // Drop all indexes
    await collection.dropIndexes();
    console.log("Dropped all indexes");

    // Drop the collection completely
    await collection.drop();
    console.log("Dropped collection");

    // Recreate indexes
    await collection.createIndex(
      { aadharNumber: 1 },
      {
        unique: true,
        sparse: true,
        background: true,
        name: "aadharNumber_unique", // Explicitly name the index
      }
    );
    await collection.createIndex(
      { email: 1 },
      {
        unique: true,
        sparse: true,
        background: true,
        name: "email_unique",
      }
    );
    await collection.createIndex(
      { username: 1 },
      {
        unique: true,
        sparse: true,
        background: true,
        name: "username_unique",
      }
    );

    // Verify indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    console.log("Database reset complete");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
