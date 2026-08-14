import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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
      const res = await api.post("/auth/register", formData);
      console.log(res.data);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
          <h2>Create Account 🎉</h2>
          <p>Join us today and manage your business!</p>
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
            <label>Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <small className="input-hint">Minimum 6 characters</small>
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Registering...
              </>
            ) : (
              <>Register →</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Cross Navigation Link */}
        <div className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login here
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

export default Register;