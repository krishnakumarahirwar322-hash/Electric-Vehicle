import { Car, Clock3, LogOut, UserCircle, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserSideBar.css";
import { clearAuthSession, getAuthUser } from "../../services/authSession";

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getAuthUser();
  const menuItems = [
    { name: "Ride", icon: Car, path: "/user/home" },
    { name: "History", icon: Clock3, path: "/user/history" },
    { name: "Profile", icon: UserCircle, path: "/user/profile" }
  ];
  const logout = () => {
    clearAuthSession();
    navigate("/login");
  };
  return (
    <aside className="user-sidebar">
      <div className="user-sidebar-logo"><div className="user-logo-icon"><Zap size={20} fill="currentColor" /></div><div><h2>VoltRide</h2><span title={currentUser?.name || "User panel"}>{currentUser?.name || "User panel"}</span></div></div>
      <nav className="user-sidebar-menu">
        {menuItems.map(({ name, icon: Icon, path }) => <button key={path} className={`user-sidebar-item ${location.pathname === path ? "active" : ""}`} onClick={() => navigate(path)}><Icon size={20} /><span>{name}</span></button>)}
      </nav>
      <button className="user-sidebar-logout" onClick={logout}><LogOut size={18} /><span>Logout</span></button>
    </aside>
  );
};

export default UserSidebar;
