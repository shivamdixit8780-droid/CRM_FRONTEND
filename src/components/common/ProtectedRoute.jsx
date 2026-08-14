// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ Pehle loading check karo
  // Jab tak auth check complete nahi, kuch mat karo
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Loading...</p>
      </div>
    );
  }

  // ✅ User nahi hai toh login pe bhejo
  // state mein location save karo taaki login ke baad wapas aaye
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ✅ User hai toh page dikhao
  return children;
}

// Inline styles for loading screen
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f9fafb",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  text: {
    marginTop: "12px",
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default ProtectedRoute;