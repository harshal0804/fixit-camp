import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";
import { Nav } from "react-bootstrap";
import { Map, BarChart2, MessageSquare, CheckCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <div className="admin-info">
          <span>admin</span>
        </div>
      </div>

      <Nav className="flex-column">
        <Nav.Item>
          <Link
            to="/admin"
            className={`nav-link d-flex align-items-center gap-2 ${
              location.pathname === "/admin" ? "active" : ""
            }`}
          >
            <Map size={20} />
            Map View
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            to="/admin/reports"
            className={`nav-link d-flex align-items-center gap-2 ${
              location.pathname === "/admin/reports" ? "active" : ""
            }`}
          >
            <BarChart2 size={20} />
            Reports
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            to="/admin/spam"
            className={`nav-link d-flex align-items-center gap-2 ${
              location.pathname === "/admin/spam" ? "active" : ""
            }`}
          >
            <MessageSquare size={20} />
            Spam
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            to="/admin/resolved"
            className={`nav-link d-flex align-items-center gap-2 ${
              location.pathname === "/admin/resolved" ? "active" : ""
            }`}
          >
            <CheckCircle size={20} />
            Resolved
          </Link>
        </Nav.Item>
      </Nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleLogout} 
          className="logout-button d-flex align-items-center justify-content-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
