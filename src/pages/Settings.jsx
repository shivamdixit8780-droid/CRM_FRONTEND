import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  getCompanySettings,
  updateCompanySettings,
  changePassword,
  getLoginHistory,
} from "../services/settingsService";
import api from "../services/api";
import "../styles/Settings.css";

function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.role === "admin";

  // Company Settings
  const [company, setCompany] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // Password change
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState("");

  // Profile photo
  const [photoFile, setPhotoFile] = useState(null);
  const [photoMsg, setPhotoMsg] = useState("");

  // Login history
  const [history, setHistory] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompany();
    fetchHistory();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await getCompanySettings();
      setCompany(res.data);
      setCompanyName(res.data.companyName);
    } catch (err) {
      setError("Company settings load nahi ho paayi");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await getLoginHistory();
      setHistory(res.data);
    } catch (err) {
      setError("Login history load nahi ho paayi");
    }
  };

  // ---- Company Settings save ----
  const handleCompanySave = async () => {
    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      const res = await updateCompanySettings(formData);
      setCompany(res.data);
      setLogoFile(null);
    } catch (err) {
      setError("Company settings update nahi ho payi");
    }
  };

  // ---- Password change ----
  const handlePasswordChange = async (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async () => {
    try {
      setPasswordMsg("");
      await changePassword(passwordData);
      setPasswordMsg("Password successfully changed!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || "Password change nahi ho paaya");
    }
  };

  // ---- Profile Photo ----
  const handlePhotoUpload = async () => {
    try {
      setPhotoMsg("");
      const formData = new FormData();
      formData.append("photo", photoFile);
      await api.put("/users/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoMsg("Profile photo updated!");
      setPhotoFile(null);
    } catch (err) {
      setPhotoMsg("Photo upload nahi ho paaya");
    }
  };

  return (
  <div className="settings-page">
    <h2 className="settings-title">Settings</h2>

    {error && <p className="error">{error}</p>}

    <div className="settings-grid">

      {/* Theme */}
      <div className="setting-card">
        <h4>Theme</h4>

        <p>
          Current Theme :
          <strong> {theme === "light" ? "Light" : "Dark"}</strong>
        </p>

        <button className="setting-btn" onClick={toggleTheme}>
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>

      {/* Company Settings */}
      <div className="setting-card">
        <h4>Company Settings</h4>

        {company?.companyLogo && (
          <img
            className="company-logo"
            src={`https://crm-backend-17eq.onrender.com${company.companyLogo}`}
            alt="Company Logo"
          />
        )}

        {isAdmin ? (
          <>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
            />

            <button
              className="setting-btn"
              onClick={handleCompanySave}
            >
              Save Company Settings
            </button>
          </>
        ) : (
          <p>{company?.companyName}</p>
        )}
      </div>

      {/* Profile Photo */}
      <div className="setting-card">
        <h4>Profile Photo</h4>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />

        <button
          className="setting-btn"
          onClick={handlePhotoUpload}
          disabled={!photoFile}
        >
          Upload Photo
        </button>

        {photoMsg && <p>{photoMsg}</p>}
      </div>

      {/* Account */}
      <div className="setting-card account-info">
        <h4>Account Information</h4>

        <p>
          <strong>Email :</strong> {user?.email}
        </p>

        <p>
          <strong>Role :</strong> {user?.role}
        </p>
      </div>

      {/* Password */}
      <div className="setting-card">
        <h4>Change Password</h4>

        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
        />

        <button
          className="setting-btn"
          onClick={handlePasswordSave}
        >
          Change Password
        </button>

        {passwordMsg && <p>{passwordMsg}</p>}
      </div>

      {/* Login History */}
      <div className="setting-card" style={{ gridColumn: "1 / -1" }}>
        <h4>Login History</h4>

        <table className="login-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {history.map((h) => (
              <tr key={h._id}>
                <td>{new Date(h.createdAt).toLocaleString()}</td>

                <td
                  className={
                    h.status === "Success"
                      ? "success"
                      : "failed"
                  }
                >
                  {h.status}
                </td>

                <td>{h.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  </div>
);
}
export default Settings;
