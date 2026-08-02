import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { globalSearch } from "../../services/searchService";

function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ leads: [], customers: [] });
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  // ---- Debounce: 400ms rukne ke baad hi search karo (har keystroke pe nahi) ----
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

  // ---- Bahar click karne pe dropdown band ho jaaye ----
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
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between gap-4">
      <button className="lg:hidden text-gray-600 text-2xl" onClick={onMenuClick}>
        ☰
      </button>

      <div className="flex-1 max-w-md relative" ref={wrapperRef}>
        <input
          type="text"
          placeholder="Search leads, customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search && setShowResults(true)}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ---- Search results dropdown ---- */}
        {showResults && (
          <div className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
            {!hasResults && (
              <p className="px-4 py-3 text-sm text-gray-400">Koi result nahi mila.</p>
            )}

            {results.leads.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Leads</p>
                {results.leads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => handleResultClick("lead", lead._id)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.email}</p>
                  </div>
                ))}
              </div>
            )}

            {results.customers.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Customers</p>
                {results.customers.map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => handleResultClick("customer", customer._id)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-700 font-medium hidden sm:block">
        {user?.name}
      </div>
    </div>
  );
}

export default Topbar;