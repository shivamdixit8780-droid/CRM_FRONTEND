import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  const { user, loading } = useAuth();

  // Auth check complete hone ka wait
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      <Route
        path="/verify-otp"
        element={
          user ? <Navigate to="/dashboard" replace /> : <VerifyOtp />
        }
      />

      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="employees" element={<Employees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;