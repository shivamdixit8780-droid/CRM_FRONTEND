import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Register page se bheja gaya email yahan milega
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
      const res = await api.post("/auth/verify-otp", { email, otp });

      console.log(res.data);

      // OTP verify ho gaya -> ab Login page pe bhej do
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
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Verify OTP</h2>
      <p>OTP bheja gaya hai: <b>{email}</b> par</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <br />

      <button onClick={handleResend} disabled={resending}>
        {resending ? "Resending..." : "Resend OTP"}
      </button>
    </div>
  );
}

export default VerifyOtp;