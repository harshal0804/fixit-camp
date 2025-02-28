import React, { useState, useEffect } from "react";
import { Trash2, Calendar, MapPin, ImagePlus } from 'lucide-react';
import config from "../config";
import "../components/Dashboard.css";
import { Button, Modal } from "react-bootstrap";
import { usePost } from "../context/PostContext";
import { Alert } from "react-bootstrap";
import axios from "axios";

const Resolved = () => {
  const [resolvedPosts, setResolvedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  usePost();
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchResolvedPosts = async () => {
    try {
      const response = await fetch(`${config.API_URL}/auth/posts`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const postsArray = Array.isArray(data) ? data : data.posts ? data.posts : [];
      const resolvedPosts = postsArray.filter((post) => post.status === "resolved");
      setResolvedPosts(resolvedPosts);
    } catch (error) {
      console.error("Error fetching resolved posts:", error);
      setError("Failed to fetch resolved reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // eslint-disable-next-line no-empty-pattern
  const [] = useState({ totalPosts: 0, totalUsers: 0 });
  // eslint-disable-next-line no-unused-vars
  const [reportedPosts, setReportedPosts] = useState([]);

  const handleDelete = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const postId = selectedPost._id.toString();
      const response = await fetch(`${config.API_URL}/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setResolvedPosts(prevPosts => prevPosts.filter(p => p._id !== selectedPost._id));
      setShowModal(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleFileSelect = (postId, event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedPostId(postId);
      setShowImageModal(true);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !selectedPostId) return;
  
    setUploading(true);
    setUploadError(null);
  
    try {
      // Convert image to Base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64Image = reader.result; // Base64 string
        console.log("Base64 Image:", base64Image);
  
        const requestBody = {
          solutionImage: base64Image, // Send in required format
        };
  
        // Make PUT request using Axios
        const response = await axios.put(
          `${config.API_URL}/auth/posts/${selectedPostId}/solution-image`,
          requestBody,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.status !== 200) {
          throw new Error("Failed to upload solution image");
        }
  
        await fetchResolvedPosts();
        setShowImageModal(false);
        setSelectedFile(null);
        setSelectedPostId(null);
      };
    } catch (error) {
      console.error("Error uploading solution image:", error);
      setUploadError("Failed to upload solution image");
    } finally {
      setUploading(false);
    }
  };
  

  useEffect(() => {
    fetchResolvedPosts();
  }, []);

  const toggleDescription = (postId, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  if (loading) {
    return <div className="loading">Loading resolved reports...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Resolved Reports</h2>
      <div className="d-flex flex-wrap gap-4">
        {resolvedPosts.map((post) => (
          <div 
            key={post._id} 
            className="card" 
            style={{  
              width: '350px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #eee',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <div className="card-body p-4">
              <h5 className="card-title mb-2">{post.title}</h5>
              
              <span 
                className="badge d-inline-block mb-3"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem'
                }}
              >
                {post.category}
              </span>

              <div className="mb-3">
                <p className="text-muted" style={{ 
                  fontSize: '0.9rem',
                  margin: 0,
                  ...(expandedPosts.has(post._id) ? {} : {
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  })
                }}>
                  {post.description}
                </p>
                {post.description.length > 150 && (
                  <span
                    onClick={(e) => toggleDescription(post._id, e)}
                    style={{ 
                      color: '#2196F3',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'inline-block',
                      marginTop: '4px'
                    }}
                  >
                    {expandedPosts.has(post._id) ? 'Read less' : '...Read more'}
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center gap-2 mb-2">
                <Calendar size={16} className="text-muted" />
                <small className="text-muted">
                  {formatDate(post.createdAt)}
                </small>
              </div>

              <div className="d-flex align-items-center gap-2 mb-3">
                <MapPin size={16} className="text-muted" />
                <small className="text-muted">
                  {post.location.address || "No address available"}
                </small>
              </div>

              <div className="d-flex gap-2 mt-3">
                <Button 
                  variant="danger"
                  onClick={() => handleDelete(post)}
                  style={{ 
                    borderRadius: '8px',
                    padding: '8px',
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 'unset'
                  }}
                >
                  <Trash2 size={16} />
                </Button>
                
                <Button
                  variant="primary"
                  style={{ 
                    borderRadius: '8px',
                    padding: '8px',
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 'unset',
                    position: 'relative'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(post._id, e)}
                    style={{
                      opacity: 0,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  />
                  <ImagePlus size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedPost?.title}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload After Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFile && (
            <div>
              <p>Selected file: {selectedFile.name}</p>
              {uploadError && (
                <Alert variant="danger">{uploadError}</Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleImageUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Resolved;