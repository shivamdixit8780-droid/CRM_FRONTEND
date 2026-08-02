import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile } from "../services/profileService";
import "../styles/Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    employeeId: "",
    designation: "",
    department: "",
    dateOfJoining: "",
    address: "",
    emergencyContact: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        mobile: res.data.mobile || "",
        employeeId: res.data.employeeId || "",
        designation: res.data.designation || "",
        department: res.data.department || "",
        dateOfJoining: res.data.dateOfJoining ? res.data.dateOfJoining.slice(0, 10) : "",
        address: res.data.address || "",
        emergencyContact: res.data.emergencyContact || "",
      });
    } catch (err) {
      setError("Profile load nahi ho paayi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSuccess("");
      setError("");
      const res = await updateMyProfile(formData);
      setProfile(res.data);
      setIsEditing(false);
      setSuccess("Profile update ho gayi!");
    } catch (err) {
      setError("Update nahi ho paaya");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
  <div className="profile-page">

    <div className="profile-header">
      <h2 className="profile-title">My Profile</h2>

      <button
        className="profile-btn"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "Cancel" : "Edit Profile"}
      </button>
    </div>

    {error && <p className="error">{error}</p>}
    {success && <p className="success">{success}</p>}

    <div className="profile-card">

      <div className="profile-info">
        <p><b>Email:</b> {profile.email}</p>
        <p><b>Role:</b> {profile.role}</p>
        <p><b>Status:</b> {profile.status}</p>
        <p>
          <b>Reporting Manager:</b>{" "}
          {profile.reportingManager
            ? profile.reportingManager.name
            : "—"}
        </p>
      </div>

      <hr className="profile-divider" />

      {isEditing ? (

        <div className="profile-form">

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Designation</label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Sales Manager">Sales Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <label>Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <button
              className="profile-btn save-btn"
              onClick={handleSave}
            >
              Save Profile
            </button>
          </div>

        </div>

      ) : (

        <div className="readonly-info">
          <p><b>Full Name:</b> {profile.name}</p>
          <p><b>Employee ID:</b> {profile.employeeId || "—"}</p>
          <p><b>Designation:</b> {profile.designation || "—"}</p>
          <p><b>Department:</b> {profile.department || "—"}</p>
          <p><b>Mobile Number:</b> {profile.mobile || "—"}</p>
          <p>
            <b>Date of Joining:</b>{" "}
            {profile.dateOfJoining
              ? new Date(profile.dateOfJoining).toLocaleDateString()
              : "—"}
          </p>
          <p><b>Address:</b> {profile.address || "—"}</p>
          <p><b>Emergency Contact:</b> {profile.emergencyContact || "—"}</p>
        </div>

      )}

    </div>

  </div>
);
}

export default Profile;