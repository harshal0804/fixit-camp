import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { BsEye, BsTrash, BsCheck, BsClockHistory, BsHourglassSplit, BsCheckCircle } from 'react-icons/bs';
import config from "../config";

// Predefined categories
const CATEGORIES = [
  "All",
  "Road Issue",
  "Water Supply",
  "Electricity",
  "Garbage",
  "Public Safety",
  "Others",
];

const getStatusStyle = (status) => {
  switch(status) {
    case 'pending':
      return {
        color: '#FFA500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      };
    case 'in-progress':
      return {
        color: '#2196F3',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      };
    case 'resolved':
      return {
        color: '#4CAF50',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      };
    default:
      return {
        color: '#997404',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      };
  }
};

const StatusDisplay = ({ status }) => {
  const getIcon = () => {
    switch(status) {
      case 'pending':
        return <BsHourglassSplit />;
      case 'in-progress':
        return <BsClockHistory />;
      case 'resolved':
        return <BsCheckCircle />;
      default:
        return <BsHourglassSplit />;
    }
  };

  const getDisplayText = () => {
    switch(status) {
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Pending';
    }
  };

  return (
    <div style={getStatusStyle(status)}>
      {getIcon()}
      <span>{getDisplayText()}</span>
    </div>
  );
};

function Spam() {
  const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0 });
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (postId) => {
    try {
      await fetch(`${config.API_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleClearReports = async (postId) => {
    try {
      await fetch(
        `${config.API_URL}/admin/posts/${postId}/clear-reports`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      fetchData(); // Refresh data after clearing reports
    } catch (error) {
      console.error("Error clearing reports:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredPosts =
    selectedCategory === "All"
      ? reportedPosts
      : reportedPosts.filter((post) => post.category === selectedCategory);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">Spam Reports</h2>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex flex-column">
                <span className="text-muted">Total Posts</span>
                <h3 className="mb-0">{stats.totalPosts}</h3>
                <small className="text-success">+2 from last week</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex flex-column">
                <span className="text-muted">Total Users</span>
                <h3 className="mb-0">{stats.totalUsers}</h3>
                <small className="text-success">+3 from last week</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600' 
          }}>Reported Posts</h5>
          <p className="text-muted mb-4">A list of reported posts that require moderation.</p>
          
          <Form.Group className="mb-4">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Table 
            responsive 
            hover 
            bordered
            style={{
              borderCollapse: 'separate',
              borderSpacing: 0,
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th className="px-4 py-3" style={{ borderBottom: '2px solid #dee2e6' }}>Title</th>
                <th className="px-4 py-3" style={{ borderBottom: '2px solid #dee2e6' }}>Category</th>
                <th className="px-4 py-3" style={{ borderBottom: '2px solid #dee2e6' }}>Reports</th>
                <th className="px-4 py-3" style={{ borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th className="px-4 py-3" style={{ borderBottom: '2px solid #dee2e6' }}>Created</th>
                <th className="px-4 py-3" style={{ borderBottom: '2px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post._id}>
                  <td className="px-4 py-3">{post.title}</td>
                  <td className="px-4 py-3">{post.category || "Uncategorized"}</td>
                  <td className="px-4 py-3">{post.reportCount}</td>
                  <td className="px-4 py-3">
                    <StatusDisplay status={post.status || "pending"} />
                  </td>
                  <td className="px-4 py-3">{new Date(post.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="d-flex gap-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>View Details</Tooltip>}
                      >
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setShowModal(true);
                          }}
                        >
                          <BsEye size={16} />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Clear Reports</Tooltip>}
                      >
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleClearReports(post._id)}
                        >
                          <BsCheck size={16} />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Post</Tooltip>}
                      >
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(post._id)}
                        >
                          <BsTrash size={16} />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Post Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Post Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost && (
            <>
              <h5>{selectedPost.title}</h5>
              <p>
                <strong>Category:</strong>{" "}
                {selectedPost.category || "Uncategorized"}
              </p>
              <p>{selectedPost.description}</p>
              <p>
                <strong>Status:</strong> {selectedPost.status || "Pending"}
              </p>
              <p>
                <strong>Reports:</strong> {selectedPost.reportCount}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(selectedPost.createdAt)}
              </p>
              {selectedPost.location && (
                <p>
                  <strong>Location:</strong> {selectedPost.location.latitude},{" "}
                  {selectedPost.location.longitude}
                </p>
              )}
              {selectedPost.image && (
                <div className="mt-3">
                  <strong>Image:</strong>
                  <div className="text-center mt-2">
                    <img
                      src={selectedPost.image}
                      alt="Post"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Spam;
