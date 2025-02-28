import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  BarChart, PieChart, RadarChart, Bar, Pie, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, 
  XAxis, YAxis, CartesianGrid
} from 'recharts';
import "../components/Dashboard.css";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Reports = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const { posts } = location.state || { 
    status: 'all', 
    posts: null
  };

  useEffect(() => {
    if (!posts) {
      fetchAllPosts();
    } else {
      setAllPosts(posts);
      setFilteredPosts(posts);
      setLoading(false);
    }
  }, [posts]);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/auth/posts`, {
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
      const postsArray = Array.isArray(data) ? data : data.posts || [];
      setAllPosts(postsArray);
      setFilteredPosts(postsArray);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = (filterType) => {
    const now = new Date();
    let filtered = [];

    if (filterType === "thisWeek") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      filtered = allPosts.filter(post => new Date(post.createdAt) >= startOfWeek);
    } else if (filterType === "thisMonth") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = allPosts.filter(post => new Date(post.createdAt) >= startOfMonth);
    } else if (filterType === "all") {
      filtered = allPosts;
    } else {
      // Filter by specific month
      const [year, month] = filterType.split("-");
      filtered = allPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate.getFullYear() === parseInt(year) && postDate.getMonth() === parseInt(month);
      });
    }

    setFilteredPosts(filtered);
    setFilter(filterType);
  };

  const handleRowClick = (post) => {
    setSelectedReport(post);
    setShowReportModal(true);
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/auth/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      const updatedPosts = filteredPosts.map(post => 
        post._id === postId ? { ...post, status: newStatus } : post
      );
      setFilteredPosts(updatedPosts);
      setSelectedReport({ ...selectedReport, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">{error}</div>;

  const statusCounts = filteredPosts.reduce((acc, post) => {
    const statusKey = post.status.replace(/\s+/g, ""); // Remove spaces
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    return acc;
  }, {});
  
  const barChartData = [
    {
      name: "Reports",
      Pending: statusCounts["pending"] || 0,
      "In Progress": statusCounts["in-progress"] || 0,
      Resolved: statusCounts["resolved"] || 0,
    }
  ];

  const barColors = {
    Pending: "#F97316",
    "In Progress": "#3B82F6",
    Resolved: "#22C55E"
  };

  const categoryCounts = filteredPosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});

  const categoryColors = {
    Water: "#3498DB",        // Blue  
    Roads: "#E74C3C",        // Red  
    Landslides: "#F39C12",   // Orange  
    Electricity: "#9B59B6",  // Purple  
    Sanitation: "#2ECC71",   // Green  
    Others: "#34495E"        // Dark Gray  
  };
  
  const pieChartData = Object.keys(categoryCounts).map((category, index) => ({
    name: category,
    value: categoryCounts[category],
    fill: categoryColors[category] || Object.values(categoryColors)[index % Object.values(categoryColors).length] // Fallback for unknown categories
  }));
  
  const modalStyles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    },
    content: {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '20px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflow: 'hidden'
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'black',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      color: 'white',
      fontSize: '24px',
      lineHeight: '1',
      padding: '0 0 3px 0'
    },
    image: {
      maxWidth: '100%',
      maxHeight: 'calc(90vh - 40px)',
      borderRadius: '12px',
      objectFit: 'contain'
    }
  };

  const createMarkerIcon = (color) => {
    return L.divIcon({
      className: `custom-marker ${color}`,
      html: `<div class="marker-pin" style="background-color: ${color}"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <h2 className="m-0">All Reports</h2>
      </div>
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '150px' }}
          value={filter} 
          onChange={(e) => filterPosts(e.target.value)}
        >
          <option value="all">All</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      <div className="d-flex flex-wrap gap-4 mb-4">
        {/* Reports by Status */}
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <div className="card-body">
            <h5 className="card-title mb-4">Reports by Status</h5>
            <BarChart width={400} height={300} data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
              <Bar dataKey="Pending" fill={barColors.Pending} />
              <Bar dataKey="In Progress" fill={barColors["In Progress"]} />
              <Bar dataKey="Resolved" fill={barColors.Resolved} />
          </BarChart>
          </div>
        </div>
        
        {/* Reports by Category */}
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <div className="card-body">
            <h5 className="card-title mb-4">Reports by Category</h5>
            <PieChart width={400} height={300}>
            <Pie 
              data={pieChartData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
                outerRadius={100} 
                fill="#8884d8"
              label 
              >
              </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          </div>
        </div>  

        {/* Reports Comparison */}
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <div className="card-body">
            <h5 className="card-title mb-4">Reports Comparison</h5>
            <RadarChart outerRadius={100} width={400} height={300} data={pieChartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
              <Radar name="Reports" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </div>
      </div>
      </div>

      {/* Reports List Table */}
      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Category</th>
                <th>Created</th>
                <th>Location</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr 
                  key={post._id} 
                  onClick={() => handleRowClick(post)}
                  style={{ cursor: 'pointer' }}
                  className="hover-row"
                >
                  <td>{post._id}</td>
                  <td>
                    <span className={`badge bg-${post.status === 'pending' ? 'warning' : 
                      post.status === 'in-progress' ? 'primary' : 'success'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.category}</td>
                  <td>{new Date(post.createdAt).toLocaleString()}</td>
                  <td>{post.location.address}</td>
                  <td>
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt="Report" 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover', 
                          borderRadius: '4px',
                          cursor: 'pointer' 
                        }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(post.image);
                          setShowImageModal(true);
                        }}
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showImageModal && selectedImage && (
        <div 
          style={modalStyles.modal} 
          onClick={() => setShowImageModal(false)}
        >
          <div 
            style={modalStyles.content}
            onClick={e => e.stopPropagation()}
          >
            <button 
              style={modalStyles.closeButton}
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Report Details"
              style={modalStyles.image}
            />
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div 
          style={modalStyles.modal} 
          onClick={() => setShowReportModal(false)}
        >
          <div 
            style={{
              ...modalStyles.content,
              width: '600px',
              maxWidth: '95%',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '24px 24px 0',
              position: 'relative',
              borderBottom: '1px solid #eee'
            }}>
              <button 
                style={modalStyles.closeButton}
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
              <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Report Details</h3>
            </div>

            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div className="mb-4">
                <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Status</h5>
                <div className="d-flex align-items-center gap-3">
                  <span className={`badge bg-${selectedReport.status === 'pending' ? 'warning' : 
                    selectedReport.status === 'in-progress' ? 'primary' : 'success'}`}
                    style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                  >
                    {selectedReport.status}
                  </span>
                  <select 
                    className="form-select"
                    style={{ width: 'auto', minWidth: '150px' }}
                    value={selectedReport.status}
                    onChange={(e) => handleStatusChange(selectedReport._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Category</h5>
                <p style={{ fontSize: '1rem', margin: 0 }}>{selectedReport.category}</p>
              </div>

              <div className="mb-4">
                <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Description</h5>
                <p style={{ fontSize: '1rem', margin: 0 }}>{selectedReport.description}</p>
              </div>

              <div className="mb-4">
                <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Location</h5>
                <p style={{ fontSize: '1rem', margin: 0 }}>
                  {selectedReport.location.address}
                  <br />
                  <small className="text-muted">
                    Lat: {selectedReport.location.latitude}, 
                    Long: {selectedReport.location.longitude}
                  </small>
                </p>
              </div>

              <div className="mb-4">
                <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Created At</h5>
                <p style={{ fontSize: '1rem', margin: 0 }}>
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedReport.image && (
                <div className="mb-4">
                  <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Image</h5>
                  <img
                    src={selectedReport.image}
                alt="Report" 
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedImage(selectedReport.image);
                      setShowImageModal(true);
                      setShowReportModal(false);
                    }}
                  />
                </div>
              )}

              <div className="mb-4">
                <h5 style={{ fontSize: '1.1rem', color: '#666' }}>Location on Map</h5>
                <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer
                    center={[selectedReport.location.latitude, selectedReport.location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[selectedReport.location.latitude, selectedReport.location.longitude]}
                      icon={createMarkerIcon('#ef4444')}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Reports;
