import React from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Drivers",
    path: "/admin/drivers",
    icon: Users,
  },
  {
    name: "Rides",
    path: "/admin/rides",
    icon: Car,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-box">
            V
          </div>

          <div className="logo-text">
            <h2>VoltRide</h2>
            <span>Admin</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
              >
                <Icon size={20} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* Admin Profile */}
        <div className="sidebar-profile">

          <div className="profile-avatar">
            A
          </div>

          <div>
            <h4>Admin</h4>
            <p>Administrator</p>
          </div>

        </div>

      </aside>


      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "mobile-nav-link active"
                  : "mobile-nav-link"
              }
            >
              <Icon size={21} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>
    </>
  );
};

export default Sidebar;