const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: String,
    },
    category: {
      type: String,
      enum: [
        "Technical",
        "Parking",
        "Electrical & Lighting",
        "Academics & Administration",
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
    username: {
      type: String,
      required: true,
    },
    upvotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator: function (v) {
          if (!Array.isArray(v)) return false;
          return new Set(v.map((id) => id.toString())).size === v.length;
        },
        message: "Duplicate votes are not allowed",
      },
    },
    downvotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator: function (v) {
          if (!Array.isArray(v)) return false;
          return new Set(v.map((id) => id.toString())).size === v.length;
        },
        message: "Duplicate votes are not allowed",
      },
    },
    reports: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          reason: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual fields
postSchema.virtual("author", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Add a pre-save middleware to ensure arrays are initialized
postSchema.pre("save", function (next) {
  if (!this.upvotes) this.upvotes = [];
  if (!this.downvotes) this.downvotes = [];
  next();
});

module.exports = mongoose.model("Post", postSchema);
