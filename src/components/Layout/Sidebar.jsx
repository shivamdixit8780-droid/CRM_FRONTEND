import {
  LayoutDashboard,
  Users,
  UserRound,
  ShoppingCart,
  Package,
  UserCog,
  BarChart3,
  Settings,
  CircleUserRound,
  ChevronRight,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/sidebar.css";

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: UserRound },
  { to: "/products", label: "Products", icon: Package },
  { to: "/employees", label: "Employees", icon: UserCog },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const bottomLinks = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: CircleUserRound },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();

  const linkClass = (path) => {
    return location.pathname === path
      ? "sidebar-link active"
      : "sidebar-link";
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-close"}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <h1 className="logo-title">
            CRM<span className="logo-highlight">Pro</span>
          </h1>
          <p className="logo-subtitle">Sales Management System</p>
        </div>

        {/* Main Menu */}
        <div className="sidebar-menu">
          <div className="menu-list">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={linkClass(link.to)}
                >
                  <Icon size={20} className="menu-icon" />
                  <span className="menu-text">{link.label}</span>
                  <ChevronRight size={16} className="menu-arrow" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="sidebar-bottom">
          <div className="menu-list">
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={linkClass(link.to)}
                >
                  <Icon size={20} className="menu-icon" />
                  <span className="menu-text">{link.label}</span>
                  <ChevronRight size={16} className="menu-arrow" />
                </Link>
              );
            })}
          </div>

          {/* ✅ CLICKABLE User Card - Profile page pe le jayega */}
          <Link
            to="/profile"
            onClick={onClose}
            className="sidebar-user"
          >
            <div className="user-top">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="Profile"
                className="user-avatar"
              />
              <div className="user-details">
                <h3 className="user-name">
                  {user?.name || "Shivam Dixit"}
                </h3>
                <p className="user-role">
                  {user?.role || "Administrator"}
                </p>
              </div>
            </div>

            <div className="user-status">
              <span className="status-dot"></span>
              <span className="status-text">Online</span>
            </div>
          </Link>

        </div>
      </aside>
    </>
  );
}

export default Sidebar;