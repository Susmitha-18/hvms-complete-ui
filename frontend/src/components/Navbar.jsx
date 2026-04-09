import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 py-4 px-3 sm:px-5">
        {/* 🚚 Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() =>
            navigate(
              user.role === "driver" ? "/driver-dashboard" : "/admin-dashboard"
            )
          }
        >
          <div className="w-9 h-9 bg-yellow-300 rounded flex items-center justify-center text-gray-900 font-bold shadow-inner">
            🚚
          </div>
          <span className="font-semibold text-lg tracking-wide">
            HVMS {user.role === "driver" ? "Driver" : "Admin"}
          </span>
        </div>

        {/* 🧭 Navigation Links */}
        <nav className="ml-6 flex flex-wrap gap-2 sm:gap-4 items-center text-sm w-full sm:w-auto">
          {user.role === "admin" ? (
            <>
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/vehicles"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Vehicles
              </NavLink>
              <NavLink
                to="/drivers"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Drivers
              </NavLink>
              <NavLink
                to="/maintenance"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Maintenance
              </NavLink>
              <NavLink
                to="/salary"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                💵 Salary
              </NavLink>
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Clients
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/driver-dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/vehicle-history"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Vehicle History
              </NavLink>
              <NavLink
                to="/salary"
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-1 rounded-md bg-yellow-200 text-gray-900 font-medium"
                    : "hover:underline hover:text-yellow-300"
                }
              >
                Salary
              </NavLink>
            </>
          )}
        </nav>

        {/* 👤 Right Side Info */}
        <div className="ml-auto flex items-center gap-3 text-sm mt-2 sm:mt-0">
          <button
            onClick={() =>
              navigate(
                user.role === "driver" ? "/driver-dashboard" : "/admin"
              )
            }
            className="px-3 py-1 rounded-md bg-yellow-100 text-gray-900 hover:bg-yellow-200 transition font-medium"
          >
            {user.role === "driver" ? "Driver" : "Admin"}
          </button>

          <div className="text-xs opacity-80">
            {user.username || "Guest"}
          </div>

          <button
            onClick={handleSignOut}
            className="ml-2 text-sm hover:underline hover:text-yellow-400 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
