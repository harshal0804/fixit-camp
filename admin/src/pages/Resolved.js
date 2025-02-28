import React, { useState, useEffect } from "react";
import { Trash2, Upload, Calendar, MapPin } from 'lucide-react';
import config from "../config";
import "../components/Dashboard.css";
import { Button, Modal } from "react-bootstrap";
import { usePost } from "context/PostContext";
import { useDropzone } from "react-dropzone";
import { Alert } from "react-bootstrap";

const Resolved = () => {
  const [resolvedPosts, setResolvedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { deletePost } = usePost();
  const [image, setImage] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());

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

  const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0 });
  const [reportedPosts, setReportedPosts] = useState([]);

  const fetchData = async () => {
    try {
      const [statsResponse, postsResponse] = await Promise.all([
        fetch(`${config.API_URL}/admin/stats`, {
          credentials: "include",
        }),
        fetch(`${config.API_URL}/admin/reported-posts`, {
          credentials: "include",
        }),
      ]);

      const statsData = await statsResponse.json();
      const postsData = await postsResponse.json();

      setStats(statsData);
      setReportedPosts(postsData.posts || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchResolvedPosts();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(URL.createObjectURL(file));
    },
  });

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

            {post.image && (
                <div className="mb-3">
                  <img
                    src={post.image}
                    alt="Report"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                  />
                </div>
              )}

              <div className="d-flex gap-2 mt-3">
                <div {...getRootProps()} style={{ flex: 1 }}>
                  <input {...getInputProps()} />
                  <Button 
                    variant="light"
                    className="w-100 d-flex align-items-center gap-2"
                    style={{ 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      padding: '8px 16px',
                      color: '#374151',
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    <Upload size={16} />
                    <span style={{ fontSize: '0.875rem' }}>Upload After Image</span>
                  </Button>
                </div>

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
              </div>

              {image && (
                <div className="mt-3">
                  <img
                    src={image}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                  />
                </div>
              )}
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
    </div>
  );
};

export default Resolved;
