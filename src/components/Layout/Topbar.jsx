import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { globalSearch } from "../../services/searchService";
import "../../styles/Topbar.css";

function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ leads: [], customers: [] });
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  // ---- Debounce: 400ms delay ----
  useEffect(() => {
    if (search.trim() === "") {
      setResults({ leads: [], customers: [] });
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await globalSearch(search);
        setResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ---- Close dropdown on outside click ----
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (type, id) => {
    setSearch("");
    setShowResults(false);
    if (type === "lead") navigate(`/leads?id=${id}`);
    else navigate(`/customers?id=${id}`);
  };

  const hasResults = results.leads.length > 0 || results.customers.length > 0;

  return (
    <div className="topbar">

      {/* Mobile menu button */}
      <button className="topbar-menu-btn" onClick={onMenuClick}>
        ☰
      </button>

      {/* Search area */}
      <div className="topbar-search-wrapper" ref={wrapperRef}>
        <input
          type="text"
          placeholder="Search leads, customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search && setShowResults(true)}
          className="topbar-search-input"
        />

        {/* Results dropdown */}
        {showResults && (
          <div className="search-dropdown">

            {!hasResults && (
              <p className="no-results">Koi result nahi mila.</p>
            )}

            {results.leads.length > 0 && (
              <div>
                <p className="dropdown-section-title">Leads</p>
                {results.leads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => handleResultClick("lead", lead._id)}
                    className="dropdown-item"
                  >
                    <p className="item-name">{lead.name}</p>
                    <p className="item-email">{lead.email}</p>
                  </div>
                ))}
              </div>
            )}

            {results.customers.length > 0 && (
              <div>
                <p className="dropdown-section-title">Customers</p>
                {results.customers.map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => handleResultClick("customer", customer._id)}
                    className="dropdown-item"
                  >
                    <p className="item-name">{customer.name}</p>
                    <p className="item-email">{customer.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User name */}
      <div className="topbar-user">
        {user?.name}
      </div>

    </div>
  );
}

export default Topbar;