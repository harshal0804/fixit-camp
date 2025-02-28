import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircleDot } from "lucide-react";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const success = await login({ email, password });
      if (success) {
        navigate("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand">Nagrik Seva</div>
      </div>
      <div className="login-container">
        <div className="login-content">
          <h1>Crowdsourced Issue Reporting Platform</h1>
          <p>
            Empower citizens to report local issues like potholes, broken
            streetlights, and waste overflow. Together, we can build a better
            and cleaner neighborhood! An easy-to-use platform for reporting and
            tracking local issues. Contribute to your community by reporting
            concerns and getting real-time updates on resolutions.
          </p>
        </div>
        <div className="login-box">
          <div className="admin-selector">
            <CircleDot size={20} color="#f97316" />
            <span>Admin</span>
          </div>

          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Sign in</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
