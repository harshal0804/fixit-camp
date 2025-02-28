import React, { createContext, useState, useContext } from "react";
import config from "../config"; // Create this if you haven't already

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_URL}/auth/posts/public`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_URL}/auth/posts`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }

      const data = await response.json();
      setUserPosts(data || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }

      const response = await fetch(`${config.API_URL}/auth/posts/${postId.toString()}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete post');
      }

      // Update local state after successful deletion
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, message: error.message };
    }
  };

  const updatePost = async (postId, updates) => {
    try {
      const response = await fetch(`${config.API_URL}/auth/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      const updatedPost = await response.json();
      setUserPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      return { success: true };
    } catch (err) {
      console.error("Error updating post:", err);
      return { success: false, message: err.message };
    }
  };

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_URL}/auth/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setPosts((prevPosts) => [data, ...prevPosts]);
      return { success: true, post: data };
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const upvotePost = async (postId) => {
    try {
      console.log("Attempting to upvote post:", postId);
      const response = await fetch(
        `${config.API_URL}/auth/posts/${postId}/upvote`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Upvote response status:", response.status);
      const data = await response.text();
      console.log("Raw response:", data);

      if (!response.ok) {
        throw new Error(`Failed to upvote post: ${data}`);
      }

      const updatedPost = JSON.parse(data);
      console.log("Updated post:", updatedPost);

      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      setUserPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      return { success: true, post: updatedPost };
    } catch (err) {
      console.error("Error upvoting post:", err);
      console.error("Error details:", err.message);
      return { success: false, message: err.message };
    }
  };

  const downvotePost = async (postId) => {
    try {
      console.log("Attempting to downvote post:", postId);
      const response = await fetch(
        `${config.API_URL}/auth/posts/${postId}/downvote`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Downvote response status:", response.status);
      const data = await response.text();
      console.log("Raw response:", data);

      if (!response.ok) {
        throw new Error(`Failed to downvote post: ${data}`);
      }

      const updatedPost = JSON.parse(data);
      console.log("Updated post:", updatedPost);

      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      setUserPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      return { success: true, post: updatedPost };
    } catch (err) {
      console.error("Error downvoting post:", err);
      console.error("Error details:", err.message);
      return { success: false, message: err.message };
    }
  };

  const reportPost = async (postId, reason) => {
    try {
      console.log("Attempting to report post:", postId);
      console.log("Report reason:", reason);

      const response = await fetch(
        `${config.API_URL}/auth/posts/${postId}/report`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ reason }),
        }
      );

      console.log("Report response status:", response.status);
      const data = await response.text();
      console.log("Raw response:", data);

      if (!response.ok) {
        throw new Error(`Failed to report post: ${data}`);
      }

      const result = JSON.parse(data);
      console.log("Report result:", result);

      // Update the post in state if it was returned
      if (result.post) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post._id === postId ? result.post : post))
        );
        setUserPosts((prevPosts) =>
          prevPosts.map((post) => (post._id === postId ? result.post : post))
        );
      }

      return { success: true, message: result.message };
    } catch (err) {
      console.error("Error reporting post:", err);
      console.error("Error details:", err.message);
      return { success: false, message: err.message };
    }
  };

  const checkReportStatus = async (postId) => {
    try {
      const response = await fetch(
        `${config.API_URL}/auth/posts/${postId}/reports`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report status");
      }

      const data = await response.json();
      console.log("Report status:", data);
      return data;
    } catch (err) {
      console.error("Error checking report status:", err);
      return null;
    }
  };

  const uploadAfterImage = async (postId, afterImage) => {
    try {
      console.log('Starting image upload for post:', postId);
      
      // Convert base64 to blob
      const base64Data = afterImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
      
      // Create form data
      const formData = new FormData();
      formData.append('afterImage', blob, 'afterImage.jpg');

      console.log('Sending upload request to:', `${config.API_URL}/auth/posts/${postId}/upload-after-image`);
      
      const response = await fetch(`${config.API_URL}/auth/posts/${postId}/upload-after-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const updatedPost = await response.json();
      console.log('Upload successful, updated post:', updatedPost);

      // Update both posts and userPosts in state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, afterImage: updatedPost.afterImage } : post
        )
      );

      setUserPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, afterImage: updatedPost.afterImage } : post
        )
      );

      return { success: true, post: updatedPost };
    } catch (error) {
      console.error('Error uploading after image:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    posts,
    userPosts,
    loading,
    error,
    fetchPosts,
    fetchUserPosts,
    deletePost,
    updatePost,
    createPost,
    upvotePost,
    downvotePost,
    reportPost,
    checkReportStatus,
    uploadAfterImage
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};

export default PostContext;
