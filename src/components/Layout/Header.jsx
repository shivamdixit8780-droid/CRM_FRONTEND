import {
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  Search,
} from "lucide-react";

import "../../styles/header.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../../services/searchService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSearch = async (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);

      const res = await globalSearch(value);

      const data = [
        ...res.data.leads.map(item => ({ ...item, type: "Lead" })),
        ...res.data.customers.map(item => ({ ...item, type: "Customer" })),
        ...res.data.orders.map(item => ({ ...item, type: "Order" })),
        ...res.data.followups.map(item => ({ ...item, type: "FollowUp" })),
        ...res.data.products.map(item => ({ ...item, type: "Product" })),
        ...res.data.users.map(item => ({ ...item, type: "Employee" })),
      ];

      setResults(data);
      setShowResults(true);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">

      {/* Left */}
      <div className="header-left">

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="menu-btn"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <div className="page-title">

          <h1>Dashboard</h1>

          <p>Welcome Back 👋</p>

        </div>

      </div>
      {/* Global Search */}
      <div className="header-search">

        <div className="search-box">
          <div className="search-input">

            <Search
              size={20}
              className="search-icon"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search Leads, Customers, Orders..."
              className="search-field"
            />
          </div>

          {loading && (
            <div className="search-loading">
              Searching...
            </div>
          )}

          {showResults && (
            <div className="search-results">
              {results.length === 0 ? (
                <div className="no-results">
                  No results found
                </div>
              ) : (
                results.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setShowResults(false);

                      switch (item.type) {
                        case "Lead":
                          navigate(`/leads?edit=${item._id}`);
                          break;
                        case "Customer":
                          navigate(`/customers?edit=${item._id}`);
                          break;
                        case "Order":
                          navigate(`/orders?edit=${item._id}`);
                          break;
                        case "FollowUp":
                          navigate(`/followups?edit=${item._id}`);
                          break;
                        case "Product":
                          navigate(`/products?edit=${item._id}`);
                          break;
                        case "Employee":
                          navigate(`/employees?edit=${item._id}`);
                          break;
                        default:
                          break;
                      }
                    }}
                    className="search-item"
                  >
                    <div className="font-medium">
                      {item.name ||
                        item.customer?.name ||
                        item.lead?.name ||
                        item.note ||
                        "Untitled"}
                    </div>

                    <span className="search-badge">
                      {item.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Right */}
      <div className="header-right">

        {/* <button className="header-icon-btn notification-btn">

          <Bell size={20} />

          <span className="notification-dot"></span>

        </button> */}

        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title={theme === "light" ? "Dark Mode" : "Light Mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Profile */}
        <button className="profile-btn"
          onClick={() => navigate("/profile")}
        >

          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="profile"
            className="profile-image"
          />

          <div className="profile-info">

            <h3 className="profile-name">
              {user?.name || "Shivam Dixit"}
            </h3>

            <p className="profile-role">
              {user?.role || "Administrator"}
            </p>

          </div>

          <ChevronDown
            size={18}
            className="profile-arrow"
          />

        </button>

      </div>

    </header>
  );
}

export default Header;