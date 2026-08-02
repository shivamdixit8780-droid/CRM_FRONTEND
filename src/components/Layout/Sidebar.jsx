import {
  LayoutDashboard,
  Users,
  UserRound,
  PhoneCall,
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

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/customers", label: "Customers", icon: UserRound },
  { to: "/followups", label: "Follow-ups", icon: PhoneCall },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
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

  const linkClass = (path) =>
    `
  flex items-center gap-4 
  px-4 py-3.5
  min-h-[48px]
  rounded-xl
  text-sm font-medium
  transition-all duration-200
  !text-white

  ${location.pathname === path
      ? "bg-blue-600 shadow-lg"
      : "hover:bg-slate-800"
    }
  `;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static top-0 left-0 h-screen w-64
        bg-slate-900 border-r border-slate-800
        flex flex-col z-40
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        `}
      >

        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-800">

          <h1 className="text-2xl font-bold tracking-wide !text-white">
            CRM<span className="text-blue-500">Pro</span>
          </h1>

          <p className="text-xs mt-2 !text-white">
            Sales Management System
          </p>

        </div>


        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6">

          <div className="flex flex-col gap-3">

            {mainLinks.map((link) => {

              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={linkClass(link.to)}
                >

                  <Icon
                    size={20}
                    className="!text-white"
                  />

                  <span className="flex-1 !text-white">
                    {link.label}
                  </span>

                  <ChevronRight
                    size={16}
                    className="!text-white"
                  />

                </Link>
              )

            })}

          </div>

        </div>



        {/* Bottom Menu */}

        <div className="border-t border-slate-800 px-4 py-5">

          <div className="flex flex-col gap-4">

            {bottomLinks.map((link) => {

              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={linkClass(link.to)}
                >

                  <Icon
                    size={20}
                    className="!text-white"
                  />

                  <span className="flex-1 !text-white">
                    {link.label}
                  </span>


                  <ChevronRight
                    size={16}
                    className="!text-white"
                  />

                </Link>
              )

            })}

          </div>



          {/* User Card */}

          <div className="mt-6 rounded-xl bg-slate-800 p-4 border border-slate-700">

            <div className="flex items-center gap-3">

              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-blue-500"
              />


              <div>

                <h3 className="text-sm font-semibold !text-white">
                  {user?.name || "Shivam Dixit"}
                </h3>


                <p className="text-xs mt-1 !text-white">
                  {user?.role || "Administrator"}
                </p>


              </div>

            </div>


            <div className="flex items-center gap-2 mt-4">

              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>

              <span className="text-xs !text-white">
                Online
              </span>

            </div>


          </div>


        </div>


      </aside>

    </>
  );
}

export default Sidebar;