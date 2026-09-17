import React, { useEffect, useState } from "react";

import api from "../../services/api";

import {
  Car,
  Wallet,
  UserCircle,
  Star,
  Search,
  Square,
  MapPin,
} from "lucide-react";

import "./Dashboard.css";

const Dashboard = () => {
  // =================================================
  // DRIVER STATE
  // =================================================

  const [driver, setDriver] = useState(null);

  // =================================================
  // DASHBOARD REAL DATA
  // =================================================

  const [dashboard, setDashboard] = useState({
    totalRides: 0,
    rating: 0,
    wallet: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =================================================
  // GET DRIVER + DASHBOARD DATA
  // =================================================

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // ============================================
        // GET LOGGED-IN DRIVER
        // Token api.js interceptor automatically bhejega
        // ============================================

        const driverResponse = await api.get("/api/drivers/me");

        console.log(
          "Dashboard Driver Data:",
          driverResponse.data
        );

        // ============================================
        // SET DRIVER DATA
        // ============================================

        if (driverResponse.data?.driver) {
          setDriver(driverResponse.data.driver);
        }

        // ============================================
        // GET DRIVER DASHBOARD STATS
        // ============================================

        const dashboardResponse = await api.get(
          "/api/drivers/dashboard"
        );

        console.log(
          "Driver Dashboard Data:",
          dashboardResponse.data
        );

        // ============================================
        // SET REAL DASHBOARD DATA
        // ============================================

        if (dashboardResponse.data?.dashboard) {
          setDashboard(
            dashboardResponse.data.dashboard
          );
        }

        console.log(
          "Driver Dashboard Connected ✅"
        );
      } catch (error) {
        console.error(
          "Dashboard fetch error:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        setError(
          error.response?.data?.message ||
            "Unable to load driver data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  // =================================================
  // LOADING
  // =================================================

  if (loading) {
    return (
      <div className="driver-dashboard">
        <main className="driver-main">
          <div style={{ padding: "30px" }}>
            Loading dashboard...
          </div>
        </main>
      </div>
    );
  }

  // =================================================
  // ERROR
  // =================================================

  if (error) {
    return (
      <div className="driver-dashboard">
        <main className="driver-main">
          <div style={{ padding: "30px" }}>
            {error}
          </div>
        </main>
      </div>
    );
  }

  // =================================================
  // DRIVER NOT FOUND
  // =================================================

  if (!driver) {
    return (
      <div className="driver-dashboard">
        <main className="driver-main">
          <div style={{ padding: "30px" }}>
            Driver data not found
          </div>
        </main>
      </div>
    );
  }

  // =================================================
  // GO OFFLINE
  // =================================================

  const handleGoOffline = () => {
    console.log("Driver going offline");
  };

  // =================================================
  // MAIN UI
  // =================================================

  return (
    <div className="driver-dashboard">

      {/* =========================================
          DESKTOP SIDEBAR
      ========================================= */}

      <aside className="driver-sidebar">

        <div className="driver-sidebar-logo">

          <div className="driver-sidebar-logo-icon">
            <Car size={22} />
          </div>

          <span>
            VoltRide
          </span>

        </div>

        <nav className="driver-sidebar-nav">

          {/* DRIVE */}

          <a
            href="/driver/dashboard"
            className="driver-sidebar-link active"
          >
            <Car size={20} />

            <span>
              Drive
            </span>
          </a>

          {/* EARNINGS */}

          <a
            href="/driver/earnings"
            className="driver-sidebar-link"
          >
            <Wallet size={20} />

            <span>
              Earnings
            </span>
          </a>

          {/* PROFILE */}

          <a
            href="/driver/profile"
            className="driver-sidebar-link"
          >
            <UserCircle size={20} />

            <span>
              Profile
            </span>
          </a>

        </nav>

      </aside>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="driver-main">

        {/* =========================================
            TOP STATUS / MAP AREA
        ========================================= */}

        <section className="driver-map-area">

          {/* Fake map/grid background */}

          <div className="driver-map-grid"></div>

          {/* Today's earning */}

          <div className="today-earning">

            <Wallet size={19} />

            <span>
              Today: ₹
              {Number(
                dashboard.wallet ?? 0
              ).toFixed(2)}
            </span>

          </div>

          {/* Online Status */}

          <div className="online-status">

            <span className="online-dot"></span>

            <span>
              ONLINE
            </span>

          </div>

          {/* Current Location */}

          <div className="current-location">

            <div className="location-pulse"></div>

            <div className="location-dot"></div>

          </div>

          {/* Map Pin */}

          <div className="map-pin">

            <MapPin size={20} />

          </div>

        </section>

        {/* =========================================
            DRIVER INFORMATION SHEET
        ========================================= */}

        <section className="driver-info-panel">

          {/* Drag handle */}

          <div className="panel-handle"></div>

          {/* =========================================
              GREETING
          ========================================= */}

          <div className="driver-greeting">

            <h1>
              Hello, {driver.name}
            </h1>

            <p>

              {driver.vehicle ||
                "Vehicle not available"}

              {" • "}

              {driver.vehicle_number ||
                "Number not available"}

            </p>

          </div>

          {/* =========================================
              STAT CARDS
          ========================================= */}

          <div className="driver-stat-grid">

            {/* =====================================
                TOTAL RIDES
            ===================================== */}

            <div className="driver-stat-card">

              <div className="driver-stat-icon ride-icon">

                <Car size={23} />

              </div>

              <strong>

                {dashboard.totalRides ?? 0}

              </strong>

              <span>
                Total Rides
              </span>

            </div>

            {/* =====================================
                RATING
            ===================================== */}

            <div className="driver-stat-card">

              <div className="driver-stat-icon rating-icon">

                <Star
                  size={23}
                  fill="currentColor"
                />

              </div>

              <strong>

                {Number(
                  dashboard.rating ?? 0
                ).toFixed(1)}

              </strong>

              <span>
                Rating
              </span>

            </div>

            {/* =====================================
                WALLET
            ===================================== */}

            <div className="driver-stat-card">

              <div className="driver-stat-icon wallet-icon">

                <Wallet size={23} />

              </div>

              <strong>

                ₹
                {Number(
                  dashboard.wallet ?? 0
                ).toFixed(2)}

              </strong>

              <span>
                Wallet
              </span>

            </div>

          </div>

          {/* =========================================
              LOOKING FOR RIDES
          ========================================= */}

          <div className="looking-rides-card">

            <div className="search-icon">

              <Search size={54} />

            </div>

            <h2>
              Looking for rides...
            </h2>

            <p>
              You will get notified when a ride is booked
            </p>

          </div>

          {/* =========================================
              GO OFFLINE
          ========================================= */}

          <button
            className="go-offline-button"
            onClick={handleGoOffline}
          >

            <span className="offline-icon">

              <Square
                size={14}
                fill="currentColor"
              />

            </span>

            <span>
              Go Offline
            </span>

          </button>

        </section>

      </main>

      {/* =========================================
          MOBILE BOTTOM NAVIGATION
      ========================================= */}

      <nav className="driver-mobile-nav">

        {/* DRIVE */}

        <a
          href="/driver/dashboard"
          className="driver-mobile-link active"
        >

          <Car size={25} />

          <span>
            Drive
          </span>

        </a>

        {/* EARNINGS */}

        <a
          href="/driver/earnings"
          className="driver-mobile-link"
        >

          <Wallet size={25} />

          <span>
            Earnings
          </span>

        </a>

        {/* PROFILE */}

        <a
          href="/driver/profile"
          className="driver-mobile-link"
        >

          <UserCircle size={25} />

          <span>
            Profile
          </span>

        </a>

      </nav>

    </div>
  );
};

export default Dashboard;