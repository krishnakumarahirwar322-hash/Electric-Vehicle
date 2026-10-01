import { useEffect, useRef, useState } from "react";
import L from "leaflet";

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
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [rideNotice, setRideNotice] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [otp, setOtp] = useState("");
  const [rideActionLoading, setRideActionLoading] = useState(false);
  const [rideActionError, setRideActionError] = useState("");
  const lastCancellationNoticeRef = useRef(null);
  const driverLocationWatch = useRef(null);
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const rideMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const activeRouteRef = useRef(null);

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
          setIsOnline(Boolean(driverResponse.data.driver.is_online));
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

  useEffect(() => {
    if (!driver) return undefined;
    const refreshRideData = async () => {
      try {
        const [requestResponse, activeResponse] = await Promise.all([
          api.get("/api/rides/driver/requests"),
          api.get("/api/rides/driver/active")
        ]);
        setRequests(requestResponse.data?.requests || []);
        const ride = activeResponse.data?.ride || null;
        if (ride?.status === "cancelled") {
          if (lastCancellationNoticeRef.current !== ride.id) {
            lastCancellationNoticeRef.current = ride.id;
            setRideNotice(`User cancelled ride #${ride.id}${ride.cancel_reason ? `: ${ride.cancel_reason}` : "."}`);
          }
          setActiveRide(null);
          return;
        }
        setRideNotice("");
        setActiveRide(ride);
      } catch (requestError) {
        console.error("Ride request refresh failed:", requestError.response?.data || requestError.message);
      }
    };
    refreshRideData();
    const timer = setInterval(refreshRideData, 1000);
    return () => clearInterval(timer);
  }, [driver]);

  useEffect(() => {
    if (!activeRide || !navigator.geolocation) return undefined;
    driverLocationWatch.current = navigator.geolocation.watchPosition(({ coords }) => {
      api.post(`/api/rides/${activeRide.id}/location`, { lat: coords.latitude, lng: coords.longitude }).catch(() => {});
    });
    return () => navigator.geolocation.clearWatch(driverLocationWatch.current);
  }, [activeRide]);

  useEffect(() => {
    if (loading || !mapElement.current || mapRef.current) return undefined;
    const map = L.map(mapElement.current).setView([28.6139, 77.209], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    mapRef.current = map;
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, [loading]);

  useEffect(() => {
    if (!mapRef.current || !activeRide?.user_lat || !activeRide?.user_lng) return;
    if (rideMarkerRef.current) rideMarkerRef.current.remove();
    rideMarkerRef.current = L.circleMarker([Number(activeRide.user_lat), Number(activeRide.user_lng)], { radius: 9, color: "#078b65", fillColor: "#19bd87", fillOpacity: 1, weight: 3 }).addTo(mapRef.current).bindTooltip("Passenger pickup");

    const driverPosition = activeRide.driver_lat && activeRide.driver_lng
      ? [Number(activeRide.driver_lat), Number(activeRide.driver_lng)]
      : null;
    if (driverPosition) {
      if (driverMarkerRef.current) driverMarkerRef.current.remove();
      driverMarkerRef.current = L.circleMarker(driverPosition, { radius: 9, color: "#078b65", fillColor: "#19bd87", fillOpacity: 1, weight: 3 }).addTo(mapRef.current).bindTooltip("You");
    }
    const target = activeRide.status === "started"
      ? [Number(activeRide.destination_lat), Number(activeRide.destination_lng)]
      : [Number(activeRide.user_lat), Number(activeRide.user_lng)];
    if (!driverPosition || !target.every(Number.isFinite)) return;
    fetch(`https://router.project-osrm.org/route/v1/driving/${driverPosition[1]},${driverPosition[0]};${target[1]},${target[0]}?overview=full&geometries=geojson`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.routes?.[0] || !mapRef.current) return;
        if (activeRouteRef.current) activeRouteRef.current.remove();
        activeRouteRef.current = L.geoJSON(data.routes[0].geometry, { style: { color: "#087f5b", weight: 6 } }).addTo(mapRef.current);
        mapRef.current.fitBounds(activeRouteRef.current.getBounds(), { padding: [35, 35] });
      })
      .catch(() => {});
  }, [activeRide]);

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

  const handleGoOffline = async () => {
    try {
      const response = await api.put("/api/drivers/online", { is_online: !isOnline });
      setIsOnline(response.data.is_online);
    } catch (statusError) {
      setError(statusError.response?.data?.message || "Online status update failed");
    }
  };

  const acceptRide = async (rideId) => {
    setRideActionLoading(true);
    setRideActionError("");
    try {
      await api.put(`/api/rides/${rideId}/accept`);
      setRequests((items) => items.filter((item) => item.id !== rideId));
    } catch (actionError) {
      setRideActionError(actionError.response?.data?.message || "Could not accept this ride. Please retry.");
    } finally {
      setRideActionLoading(false);
    }
  };

  const rejectRide = async (rideId) => {
    try {
      await api.post(`/api/rides/${rideId}/reject`);
      setRequests((items) => items.filter((item) => item.id !== rideId));
    } catch (rejectError) {
      setError(rejectError.response?.data?.message || "Ride rejection failed");
    }
  };

  const markArrived = async () => {
    setRideActionLoading(true);
    setRideActionError("");
    try {
      const response = await api.post(`/api/rides/${activeRide.id}/arrived`);
      setActiveRide((ride) => ({ ...ride, status: "arrived", otp_expires_at: response.data.otp_expires_at }));
    } catch (actionError) {
      setRideActionError(actionError.response?.data?.message || "Could not update arrival. Please retry.");
    } finally {
      setRideActionLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setRideActionError("Enter the passenger's 6-digit OTP.");
      return;
    }
    setRideActionLoading(true);
    setRideActionError("");
    try {
      await api.post(`/api/rides/${activeRide.id}/verify-otp`, { otp });
      setActiveRide((ride) => ({ ...ride, status: "started", otp_expires_at: null }));
      setOtp("");
    } catch (actionError) {
      setRideActionError(actionError.response?.data?.message || "Trip could not start. Check the OTP and retry.");
    } finally {
      setRideActionLoading(false);
    }
  };

  const completeRide = async () => {
    setRideActionLoading(true);
    setRideActionError("");
    try {
      await api.put(`/api/rides/${activeRide.id}/complete`);
      setActiveRide(null);
    } catch (actionError) {
      setRideActionError(actionError.response?.data?.message || "Ride could not be completed. Please retry.");
    } finally {
      setRideActionLoading(false);
    }
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

          <div className="driver-map-grid" ref={mapElement}></div>

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
              {isOnline ? "ONLINE" : "OFFLINE"}
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

          {requests.length > 0 && !activeRide && (
            <div className="ride-requests-card">
              <h2>New ride requests</h2>
              {requests.map((ride) => (
                <div className="driver-request" key={ride.id}>
                  <div><strong>{ride.pickup}</strong><span>to {ride.destination}</span></div>
                  <div className="request-actions">
                    <button onClick={() => acceptRide(ride.id)} disabled={rideActionLoading}>{rideActionLoading ? "Working..." : "Accept"}</button>
                    <button className="reject-request-button" onClick={() => rejectRide(ride.id)} disabled={rideActionLoading}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeRide && (
            <div className="active-ride-card">
              <h2>Active ride</h2>
              <p>{activeRide.pickup} to {activeRide.destination}</p>
              <strong>Status: {activeRide.status}</strong>
              {activeRide.status === "accepted" && <button onClick={markArrived} disabled={rideActionLoading}>{rideActionLoading ? "Updating..." : "I have arrived"}</button>}
              {activeRide.status === "arrived" && <div className="otp-entry"><input value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setRideActionError(""); }} placeholder="Enter user OTP" inputMode="numeric" autoComplete="one-time-code" maxLength="6" disabled={rideActionLoading} /><button onClick={verifyOtp} disabled={rideActionLoading || !/^\d{6}$/.test(otp)}>{rideActionLoading ? "Starting..." : "Start trip"}</button></div>}
              {activeRide.status === "started" && <button onClick={completeRide} disabled={rideActionLoading}>{rideActionLoading ? "Completing..." : "Complete ride"}</button>}
              {rideActionError && <p className="ride-action-error" role="alert">{rideActionError}</p>}
            </div>
          )}

          {rideNotice && <div className="ride-cancelled-notice" role="status">{rideNotice}</div>}

          <div className="looking-rides-card">

            <div className="search-icon">

              <Search size={54} />

            </div>

            <h2>
              {isOnline ? "Looking for rides..." : "You are offline"}
            </h2>

            <p>
              {isOnline ? "Online drivers receive new requests here" : "Go online to receive ride requests"}
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
              {isOnline ? "Go Offline" : "Go Online"}
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