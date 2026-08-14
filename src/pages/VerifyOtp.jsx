import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/verifyOtp.css";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/verify-otp", { email, otp });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const res = await api.post("/auth/resend-otp", { email });
      setMessage(res.data.message || "OTP resent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-bg-shape shape-1"></div>
      <div className="verify-bg-shape shape-2"></div>
      <div className="verify-bg-shape shape-3"></div>

      <div className="verify-card">
        <div className="verify-header">
          <div className="verify-icon">🔐</div>
          <h2>Verify OTP</h2>
          <p>
            OTP bheja gaya hai <span>{email || "your email"}</span> par
          </p>
        </div>

        {error && <div className="verify-alert error">⚠️ {error}</div>}
        {message && <div className="verify-alert success">✅ {message}</div>}

        <form onSubmit={handleVerify} className="verify-form">
          <label>Enter OTP</label>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button type="submit" className="verify-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResend}
          className="resend-btn"
          disabled={resending}
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>

        <div className="verify-footer">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;