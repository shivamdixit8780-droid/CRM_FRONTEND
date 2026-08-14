import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/layout.css";

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="layout-container">

      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* Main Content */}
      <div className="layout-main">

        {/* Header */}
        <Header onMenuClick={() => setIsOpen(true)} />

        {/* Page Content */}
        <main className="layout-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default Layout;