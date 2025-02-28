const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { ensureAuthenticated } = require("../middleware/auth");

// Public route to get all posts (for home page)
router.get("/public", async (req, res) => {
  try {
    console.log("Fetching public posts");
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    // Ensure username is available for each post
    const postsWithUsername = posts.map((post) => ({
      ...post,
      username: post.username || post.userId?.username || "Anonymous User",
    }));

    console.log("Found posts:", postsWithUsername.length);
    res.json(postsWithUsername);
  } catch (error) {
    console.error("Error fetching public posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Protected route to get posts (for authenticated users and admin)
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    console.log("User ID:", req.user._id);
    console.log("User Role:", req.user.role);

    let query = req.user.role === "admin" ? {} : { userId: req.user._id };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    // Ensure username is available for each post
    const postsWithUsername = posts.map((post) => ({
      ...post,
      username: post.username || post.userId?.username || "Anonymous User",
    }));

    console.log("Found user posts:", postsWithUsername.length);
    res.json(postsWithUsername);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Create a new post
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    console.log("Creating post for user:", req.user._id);
    console.log("Post data:", req.body);

    const { title, description, image, location, tags, category } = req.body;

    // Validate location data
    if (
      !location ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return res.status(400).json({
        message: "Invalid location data",
        error: "Location must include valid latitude and longitude",
      });
    }

    const post = new Post({
      title,
      description,
      image,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || "",
      },
      tags,
      category,
      userId: req.user._id,
      username: req.user.username || "Anonymous User",
      status: "pending",
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
});

// Update post status - only accessible by admin
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update post status" });
    }

    const post = await Post.findByIdAndUpdate(id, { status }, { new: true });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only allow admin or post owner to delete
    if (
      req.user.role !== "admin" &&
      post.userId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Use findByIdAndDelete instead of remove()
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Upvote a post
router.post("/:postId/upvote", ensureAuthenticated, async (req, res) => {
  try {
    console.log("Upvote request received for post:", req.params.postId);
    console.log("User:", req.user._id);

    const post = await Post.findById(req.params.postId);
    if (!post) {
      console.log("Post not found:", req.params.postId);
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("Current post state:", {
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    // Convert user ID to string for comparison
    const userId = req.user._id.toString();

    // Remove from downvotes if exists
    const downvoteIndex = post.downvotes.findIndex(
      (id) => id.toString() === userId
    );
    if (downvoteIndex > -1) {
      console.log("Removing downvote");
      post.downvotes.splice(downvoteIndex, 1);
    }

    // Toggle upvote
    const upvoteIndex = post.upvotes.findIndex(
      (id) => id.toString() === userId
    );
    if (upvoteIndex > -1) {
      console.log("Removing upvote");
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      console.log("Adding upvote");
      post.upvotes.push(req.user._id);
    }

    console.log("Updated post state before save:", {
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    // Use findOneAndUpdate to avoid validation issues
    const updatedPost = await Post.findOneAndUpdate(
      { _id: post._id },
      {
        $set: {
          upvotes: post.upvotes,
          downvotes: post.downvotes,
        },
      },
      {
        new: true,
        runValidators: false,
      }
    )
      .populate("userId", "username")
      .lean();

    console.log("Sending response:", updatedPost);
    res.json(updatedPost);
  } catch (error) {
    console.error("Error in upvote route:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Error updating post",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Downvote a post
router.post("/:postId/downvote", ensureAuthenticated, async (req, res) => {
  try {
    console.log("Downvote request received for post:", req.params.postId);
    console.log("User:", req.user._id);

    const post = await Post.findById(req.params.postId);
    if (!post) {
      console.log("Post not found:", req.params.postId);
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("Current post state:", {
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    // Convert user ID to string for comparison
    const userId = req.user._id.toString();

    // Remove from upvotes if exists
    const upvoteIndex = post.upvotes.findIndex(
      (id) => id.toString() === userId
    );
    if (upvoteIndex > -1) {
      console.log("Removing upvote");
      post.upvotes.splice(upvoteIndex, 1);
    }

    // Toggle downvote
    const downvoteIndex = post.downvotes.findIndex(
      (id) => id.toString() === userId
    );
    if (downvoteIndex > -1) {
      console.log("Removing downvote");
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      console.log("Adding downvote");
      post.downvotes.push(req.user._id);
    }

    console.log("Updated post state before save:", {
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    // Use findOneAndUpdate to avoid validation issues
    const updatedPost = await Post.findOneAndUpdate(
      { _id: post._id },
      {
        $set: {
          upvotes: post.upvotes,
          downvotes: post.downvotes,
        },
      },
      {
        new: true,
        runValidators: false,
      }
    )
      .populate("userId", "username")
      .lean();

    console.log("Sending response:", updatedPost);
    res.json(updatedPost);
  } catch (error) {
    console.error("Error in downvote route:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Error updating post",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Report a post
router.post("/:postId/report", ensureAuthenticated, async (req, res) => {
  try {
    console.log("Report request received for post:", req.params.postId);
    console.log("User:", req.user._id);
    console.log("Report reason:", req.body.reason);

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    // Use findOneAndUpdate to avoid validation issues
    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: req.params.postId,
        // Ensure user hasn't already reported
        "reports.userId": { $ne: req.user._id },
      },
      {
        $push: {
          reports: {
            userId: req.user._id,
            reason: reason,
          },
        },
        $inc: { reportCount: 1 },
      },
      {
        new: true,
        runValidators: false,
      }
    ).populate("userId", "username");

    if (!updatedPost) {
      const existingPost = await Post.findById(req.params.postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      return res
        .status(400)
        .json({ message: "You have already reported this post" });
    }

    console.log("Post reported successfully:", updatedPost._id);
    res.json({
      message: "Post reported successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error in report route:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Error reporting post",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Get predefined categories
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      {
        name: "Water",
        subcategories: ["Water Supply", "Drainage", "Flooding"],
      },
      {
        name: "Roads",
        subcategories: ["Potholes", "Traffic Signals", "Street Lights"],
      },
      {
        name: "Landslides",
        subcategories: [
          "Road Blockage",
          "Property Damage",
          "Emergency Response",
        ],
      },
      {
        name: "Electricity",
        subcategories: ["Power Outage", "Faulty Lines", "Street Lighting"],
      },
      {
        name: "Sanitation",
        subcategories: ["Garbage Collection", "Public Toilets", "Sewage"],
      },
      {
        name: "Others",
        subcategories: ["General", "Emergency", "Maintenance"],
      },
    ];
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
});

// Add this route to check post reports
router.get("/:postId/reports", ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .select("reportCount reports")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      reportCount: post.reportCount,
      reports: post.reports,
      reportsThreshold: 5, // The threshold we've set
      exceedsThreshold: post.reportCount >= 5,
    });
  } catch (error) {
    console.error("Error fetching post reports:", error);
    res.status(500).json({ message: "Error fetching post reports" });
  }
});

module.exports = router;
