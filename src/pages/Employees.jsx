import { useState, useEffect } from "react";
import { getEmployees, updateUserRole } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import "../styles/Employees.css";

function Employees() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError("Employees load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      fetchEmployees();
    } catch (err) {
      setError("Role update nahi ho paaya");
    }
  };

  if (loading) {
    return <p className="loading">Loading Employees...</p>;
  }

  return (
    <div className="employees-page">
      <h2 className="page-title">Employees</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="employee-card">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              {isAdmin && <th>Change Role</th>}
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.name}</td>

                <td>{emp.email}</td>

                <td>
                  <span className={`role-badge role-${emp.role}`}>
                    {emp.role}
                  </span>
                </td>

                {isAdmin && (
                  <td>
                    <select
                      className="role-select"
                      value={emp.role}
                      onChange={(e) =>
                        handleRoleChange(emp._id, e.target.value)
                      }
                    >
                      <option value="sales">Sales</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;