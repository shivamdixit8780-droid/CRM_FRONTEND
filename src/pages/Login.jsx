// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // ✅ useLocation add kiya
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ location lo
  const { login } = useAuth();

  // ✅ Jahan se aaya tha wahan bhejo, warna dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      const { token, ...user } = res.data;

      login(user, token);
      navigate(from, { replace: true }); // ✅ /dashboard ya jahan se aaya tha
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shape shape-1"></div>
      <div className="auth-bg-shape shape-2"></div>
      <div className="auth-bg-shape shape-3"></div>

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-logo">🚀</div>
          <h1 className="auth-brand-title">
            CRM<span>Pro</span>
          </h1>
          <p className="auth-brand-subtitle">Sales Management System</p>
        </div>

        {/* Form Header */}
        <div className="auth-header">
          <h2>Welcome Back 👋</h2>
          <p>Login to your CRM account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              <>Login →</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Cross Navigation Link */}
        <div className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          © 2026 CRMPro. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Login;