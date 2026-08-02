import {
  Bell,
  Moon,
  Menu,
  ChevronDown,
  Search,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../../services/searchService";
import { useAuth } from "../../context/AuthContext";

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-20 h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-6">

      {/* Left */}
      <div className="flex items-center gap-4">

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-xs text-gray-500 hidden md:block">
            Welcome back 👋
          </p>
        </div>

      </div>
      {/* Global Search */}
      <div className="hidden lg:flex flex-1 justify-center px-8">

        <div className="relative w-full max-w-2xl">
  <div className="flex items-center h-12 rounded-2xl border border-gray-300 bg-white px-4 shadow-sm">

    <Search
      size={20}
      className="text-gray-400 flex-shrink-0"
    />

    <input
      type="text"
      value={searchTerm}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search Leads, Customers, Orders, Products..."
      className="flex-1 ml-3 border-none outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
      style={{
        padding: 0,
        margin: 0,
        lineHeight: "20px",
      }}
    />
  </div>

  {loading && (
    <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-xl border p-3 z-50">
      Searching...
    </div>
  )}

  {showResults && (
    <div className="absolute left-0 right-0 mt-2 bg-white shadow-xl rounded-xl border z-50 max-h-80 overflow-y-auto">
      {results.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
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
            className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
          >
            <div className="font-medium">
              {item.name ||
                item.customer?.name ||
                item.lead?.name ||
                item.note ||
                "Untitled"}
            </div>

            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
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
      <div className="flex items-center gap-2 lg:gap-4">

        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">

          <Bell size={20} />

          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>

        </button>

        <button className="p-2 rounded-xl hover:bg-gray-100 transition">
          <Moon size={20} />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 hover:bg-gray-100 px-2 py-1 rounded-xl transition">

          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

          <div className="hidden lg:block text-left">

            <h3 className="text-sm font-semibold text-gray-800">
              {user?.name || "Shivam Dixit"}
            </h3>

            <p className="text-xs text-gray-500">
              {user?.role || "Administrator"}
            </p>

          </div>

          <ChevronDown size={18} />

        </button>

      </div>

    </header>
  );
}

export default Header;