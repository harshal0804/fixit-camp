const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    beforeImage: { type: String, required: true }, // Image uploaded by the user
    afterImage: { type: String }, // Image uploaded by the admin when resolved
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: String,
    },
    category: {
      type: String,
      enum: [
        "Water",
        "Roads",
        "Landslides",
        "Electricity",
        "Sanitation",
        "Others",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    upvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    downvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    reports: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    reportCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

// Ensure afterImage is only set when status is "resolved"
postSchema.pre("save", function (next) {
  if (this.afterImage && this.status !== "resolved") {
    return next(
      new Error("After image can only be set when the status is 'resolved'")
    );
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
