import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Link import kiya gaya hai

import api from "../../services/api";
import { clearAuthSession, getAuthUser } from "../../services/authSession";

import {
  Car,
  Wallet,
  UserCircle,
  Tag,
  FileText,
  Mail,
  Phone,
  CheckCircle,
  LogOut,
  Star,
} from "lucide-react";

import "./Profile.css";

const Profile = () => {
  const storedUser = getAuthUser() || {};
  const [driver, setDriver] = useState({
    name: storedUser.name || "Driver",
    email: storedUser.email || "driver@voltride.com",
    phone: storedUser.phone || "Not Provided",
    rating: 5.0,
    totalRides: 0,
    vehicle: "Electric Vehicle",
    vehicle_number: "Registration Pending",
    license_no: "Verified",
    status: "Approved",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await api.get("/api/drivers/me");
        if (response.data?.driver) {
          setDriver((prev) => ({
            ...prev,
            ...response.data.driver,
            name: response.data.driver.name || prev.name,
            email: response.data.driver.email || prev.email,
            phone: response.data.driver.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Driver fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  return (
    <div className="driver-profile-page">
      {/* DESKTOP SIDEBAR */}
      <aside className="driver-profile-sidebar">
        <div className="driver-profile-logo">
          <div className="driver-profile-logo-icon">
            <Car size={21} />
          </div>
          <span>VoltRide</span>
        </div>

        <nav className="driver-profile-sidebar-nav">
          <Link to="/driver/dashboard" className="driver-profile-side-link">
            <Car size={20} />
            <span>Drive</span>
          </Link>

          <Link to="/driver/earnings" className="driver-profile-side-link">
            <Wallet size={20} />
            <span>Earnings</span>
          </Link>

          <Link to="/driver/profile" className="driver-profile-side-link active">
            <UserCircle size={20} />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="driver-profile-main">
        <section className="driver-profile-header">
          <div className="driver-profile-avatar">
            {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
          </div>

          <h1>{driver.name}</h1>

          <div className="driver-profile-rating">
            <Star size={22} fill="currentColor" />
            <span>{driver.rating ?? "0.0"}</span>
            <span>•</span>
            <span>{driver.totalRides ?? 0} rides</span>
          </div>
        </section>

        <section className="driver-profile-content">
          <div className="driver-profile-card">
            <h2>Vehicle</h2>
            <div className="driver-profile-row">
              <Car size={27} />
              <span>{driver.vehicle || "Not available"}</span>
            </div>
            <div className="driver-profile-row">
              <Tag size={27} />
              <span>{driver.vehicle_number || "Not available"}</span>
            </div>
            <div className="driver-profile-row">
              <FileText size={27} />
              <span>License: {driver.license_no || "Not available"}</span>
            </div>
          </div>

          <div className="driver-profile-card">
            <h2>Contact</h2>
            <div className="driver-profile-row">
              <Mail size={27} />
              <span>{driver.email}</span>
            </div>
            <div className="driver-profile-row">
              <Phone size={27} />
              <span>{driver.phone || "Not available"}</span>
            </div>
          </div>

          <div className="driver-account-status">
            <h2>Account Status</h2>
            <div className="driver-status-row">
              <CheckCircle size={27} />
              <span>{driver.status || "Pending"} ✓</span>
            </div>
          </div>

          <button className="driver-signout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </section>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="driver-profile-mobile-nav">
        <Link to="/driver/dashboard" className="driver-profile-mobile-link">
          <Car size={25} />
          <span>Drive</span>
        </Link>

        <Link to="/driver/earnings" className="driver-profile-mobile-link">
          <Wallet size={25} />
          <span>Earnings</span>
        </Link>

        <Link to="/driver/profile" className="driver-profile-mobile-link active">
          <UserCircle size={25} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Profile;