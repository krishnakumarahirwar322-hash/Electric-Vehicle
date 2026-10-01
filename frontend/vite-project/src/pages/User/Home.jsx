import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Car, CircleDot, Clock3, CreditCard, LocateFixed, Navigation, Search, Smartphone, Square, UserCircle, WalletCards } from "lucide-react";
import L from "leaflet";
import api from "../../services/api";
import { getAuthUser } from "../../services/authSession";
import "./Home.css";

const DEFAULT_LOCATION = { lat: 28.6139, lon: 77.209 };

const Home = () => {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const activeRouteLayerRef = useRef(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driversLoaded, setDriversLoaded] = useState(false);
  const [driversError, setDriversError] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [payment, setPayment] = useState("cash");
  const [distance, setDistance] = useState(0);
  const [fare, setFare] = useState(0);
  const [locationStatus, setLocationStatus] = useState("Choose current location or enter pickup manually");
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [clockNow, setClockNow] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetDragRef = useRef({ startY: 0, dragging: false, moved: false });

  useEffect(() => {
    const timer = window.setTimeout(() => setUserName(getAuthUser()?.name || ""), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setClockNow(Date.now()), 0);
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is unavailable; enter pickup manually");
      setUseCurrentLocation(false);
      return;
    }
    setLocationStatus("Finding your current location...");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const location = { lat: coords.latitude, lon: coords.longitude };
      setPickupCoords(location);
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      pickupMarkerRef.current = L.circleMarker([location.lat, location.lon], { radius: 9, color: "#078b65", fillColor: "#19bd87", fillOpacity: 1, weight: 3 }).addTo(mapRef.current);
      mapRef.current?.setView([location.lat, location.lon], 15);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lon}`);
        const data = await response.json();
        setPickup(data.display_name || "Current location");
      } catch { setPickup("Current location"); }
      setLocationStatus("Current location selected");
    }, () => {
      setUseCurrentLocation(false);
      setLocationStatus("Location permission denied; enter pickup manually");
    }, { enableHighAccuracy: true, timeout: 10000 });
  }, []);

  useEffect(() => {
    const map = L.map(mapElement.current).setView([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    mapRef.current = map;
    api.get("/api/rides/available-drivers").then((response) => {
      const available = response.data?.drivers || [];
      setDrivers(available);
      setDriversLoaded(true);
      if (available[0]) setSelectedDriver(String(available[0].driver_id));
    }).catch((driversRequestError) => {
      setDriversLoaded(true);
      setDriversError(driversRequestError.response?.data?.message || "Available drivers could not be loaded. Check your login and backend connection.");
    });
    const locationTimer = window.setTimeout(requestCurrentLocation, 0);
    const refreshActiveRide = async () => {
      try {
        const response = await api.get("/api/rides/active");
        setActiveRide(response.data?.ride || null);
      } catch (rideError) {
        console.error("Active ride refresh failed:", rideError.response?.data || rideError.message);
      }
    };
    refreshActiveRide();
    const timer = setInterval(refreshActiveRide, 1000);
    return () => { clearInterval(timer); clearTimeout(locationTimer); map.remove(); };
  }, [requestCurrentLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (activeRide && routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (!activeRide?.driver_lat || !activeRide?.driver_lng) {
      if (activeRouteLayerRef.current) {
        activeRouteLayerRef.current.remove();
        activeRouteLayerRef.current = null;
      }
      return;
    }

    const driverPosition = [Number(activeRide.driver_lat), Number(activeRide.driver_lng)];
    if (driverMarkerRef.current) driverMarkerRef.current.remove();
    driverMarkerRef.current = L.circleMarker(driverPosition, { radius: 9, color: "#b77900", fillColor: "#f6a900", fillOpacity: 1, weight: 3 }).addTo(mapRef.current).bindTooltip("Driver");

    const target = activeRide.status === "started"
      ? [Number(activeRide.destination_lat), Number(activeRide.destination_lng)]
      : [Number(activeRide.user_lat), Number(activeRide.user_lng)];
    if (!target.every(Number.isFinite)) return;

    fetch(`https://router.project-osrm.org/route/v1/driving/${driverPosition[1]},${driverPosition[0]};${target[1]},${target[0]}?overview=full&geometries=geojson`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.routes?.[0] || !mapRef.current) return;
        if (activeRouteLayerRef.current) activeRouteLayerRef.current.remove();
        activeRouteLayerRef.current = L.geoJSON(data.routes[0].geometry, { style: { color: "#087f5b", weight: 6 } }).addTo(mapRef.current);
        mapRef.current.fitBounds(activeRouteLayerRef.current.getBounds(), { padding: [35, 35] });
      })
      .catch(() => {});
  }, [activeRide]);

  const putMarker = (type, coords) => {
    if (!mapRef.current) return;
    const markerRef = type === "pickup" ? pickupMarkerRef : destinationMarkerRef;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.circleMarker([coords.lat, coords.lon], { radius: type === "pickup" ? 9 : 8, color: type === "pickup" ? "#078b65" : "#202124", fillColor: type === "pickup" ? "#19bd87" : "#202124", fillOpacity: 1, weight: 3 }).addTo(mapRef.current);
  };

  const geocode = async (query) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);
    const results = await response.json();
    if (!results[0]) throw new Error(`Could not find "${query}" on the map`);
    return { lat: Number(results[0].lat), lon: Number(results[0].lon), label: results[0].display_name };
  };

  const calculateRoute = async (from, to) => {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`);
    const data = await response.json();
    if (!data.routes?.[0]) throw new Error("Route could not be calculated");
    const route = data.routes[0];
    const km = route.distance / 1000;
    setDistance(km);
    const selected = drivers.find((driver) => String(driver.driver_id) === selectedDriver);
    setFare(Math.max(50, km * Number(selected?.price_per_km || 12)));
    if (routeLayerRef.current) routeLayerRef.current.remove();
    routeLayerRef.current = L.geoJSON(route.geometry, { style: { color: "#078b65", weight: 5 } }).addTo(mapRef.current);
    mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [35, 35] });
  };

  const handleDestination = async () => {
    setError("");
    try {
      const from = useCurrentLocation ? pickupCoords : await geocode(pickup);
      if (!from) throw new Error("Select current location or enter a pickup location");
      const to = await geocode(destination);
      setPickupCoords(from); setDestinationCoords(to); setDestination(to.label);
      putMarker("pickup", from); putMarker("destination", to); await calculateRoute(from, to);
    } catch (routeError) { setError(routeError.message); }
  };

  const handleBookRide = async () => {
    setError(""); setMessage("");
    if (!destinationCoords || !pickupCoords || !distance) {
      setError("Choose pickup and destination first."); return;
    }
    setLoading(true);
    try {
      const response = await api.post("/api/rides", { pickup, destination, distance: Number(distance.toFixed(2)), fare: Number(fare.toFixed(2)), payment_method: payment, pickup_lat: pickupCoords.lat, pickup_lng: pickupCoords.lon, destination_lat: destinationCoords.lat, destination_lng: destinationCoords.lon });
      setActiveRide({ id: response.data.rideId, status: "requested", pickup, destination, fare });
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      setMessage("Ride requested successfully. Your driver will respond soon.");
    } catch (bookingError) { setError(bookingError.response?.data?.message || "Ride booking failed."); }
    finally { setLoading(false); }
  };

  const cancelRide = async () => {
    if (!activeRide || !cancelReason) {
      setError("Please select a cancellation reason.");
      return;
    }
    setCancelling(true);
    setError("");
    try {
      await api.delete(`/api/rides/${activeRide.id}`, { data: { reason: cancelReason } });
      setActiveRide(null);
      setCancelReason("");
      setMessage("Ride cancelled successfully.");
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || "Ride cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSheetPointerDown = (event) => {
    sheetDragRef.current = { startY: event.clientY, dragging: true, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerMove = (event) => {
    if (!sheetDragRef.current.dragging) return;
    const movedBy = event.clientY - sheetDragRef.current.startY;
    if (Math.abs(movedBy) < 20) return;
    sheetDragRef.current.moved = true;
    setSheetExpanded(movedBy < 0);
  };

  const handleSheetPointerUp = (event) => {
    if (!sheetDragRef.current.dragging) return;
    const movedBy = event.clientY - sheetDragRef.current.startY;
    sheetDragRef.current.dragging = false;
    if (!sheetDragRef.current.moved && Math.abs(movedBy) < 20) {
      setSheetExpanded((expanded) => !expanded);
    } else if (movedBy < -25) {
      setSheetExpanded(true);
    } else if (movedBy > 25) {
      setSheetExpanded(false);
    }
  };

  const showBookingForm = !activeRide || activeRide.status === "requested";
  const otpExpiresAt = activeRide?.otp_expires_at ? new Date(activeRide.otp_expires_at).getTime() : null;
  const otpSecondsLeft = otpExpiresAt && clockNow !== null ? Math.max(0, Math.ceil((otpExpiresAt - clockNow) / 1000)) : null;
  const otpExpired = otpSecondsLeft === 0;

  return (
    <div className="user-home">
      <div className="map-area" ref={mapElement} onClick={() => setSheetExpanded(false)}>
        <div className="greeting-card"><strong>{userName ? `Hi, ${userName}` : "Hi there!"}</strong><span>Book your electric ride</span></div>
        <button className="map-location-button" onClick={(event) => { event.stopPropagation(); requestCurrentLocation(); }} title="Use current location"><LocateFixed size={18} /></button>
      </div>
      <div className={`booking-panel ${sheetExpanded ? "sheet-expanded" : "sheet-collapsed"} ${!showBookingForm ? "active-ride-panel" : ""}`}>
        <div className="drag-handle" onPointerDown={handleSheetPointerDown} onPointerMove={handleSheetPointerMove} onPointerUp={handleSheetPointerUp} onPointerCancel={handleSheetPointerUp} role="button" tabIndex="0" aria-label="Move booking panel" /><h1 className="where-title">{showBookingForm ? "Where to?" : "Your live ride"}</h1>
        {showBookingForm && <div className="location-section">
          <div className="location-row"><div className="location-icon pickup-icon"><CircleDot size={15} /></div><div className="location-content"><span className="location-label">PICKUP</span><input value={pickup} onChange={(event) => { setPickup(event.target.value); setUseCurrentLocation(false); }} disabled={useCurrentLocation} placeholder="Enter pickup location" /><button className="location-choice" onClick={() => { setUseCurrentLocation(true); requestCurrentLocation(); }}><Navigation size={13} /> Use current location</button><small>{locationStatus}</small></div></div>
          <div className="location-divider" />
          <div className="location-row"><div className="location-icon drop-icon"><Square size={12} fill="currentColor" /></div><div className="location-content destination-content"><span className="location-label">DESTINATION</span><div className="destination-input"><input value={destination} onChange={(event) => { setDestination(event.target.value); setDestinationCoords(null); }} placeholder="Enter destination" /><button onClick={handleDestination} title="Find route"><Search size={16} /></button></div></div></div>
        </div>}
        {showBookingForm && <><div className="ride-summary"><span>{distance ? `${distance.toFixed(1)} km` : "Route distance"}</span><strong>{fare ? `₹${fare.toFixed(2)}` : "Fare calculated after route"}</strong></div>
        <div className="driver-availability">{drivers.length ? `${drivers.length} online driver${drivers.length > 1 ? "s" : ""} can receive this request` : driversError || (driversLoaded ? "No available drivers are online right now. You can still send a request." : "Checking online drivers...")}</div>
        <div className="payment-section"><h3>Payment</h3><div className="payment-options">{[["cash", WalletCards, "CASH"], ["upi", Smartphone, "UPI"], ["card", CreditCard, "CARD"]].map(([value, Icon, label]) => <button key={value} className={`payment-button ${payment === value ? "active" : ""}`} onClick={() => setPayment(value)}><Icon size={16} /><span>{label}</span></button>)}</div></div></>}
        {error && <p className="booking-message error">{error}</p>}{message && <p className="booking-message success">{message}</p>}
        {activeRide && <div className={`user-ride-status ${activeRide.status === "requested" ? "waiting-ride-status" : ""}`}>
          <strong>{activeRide.status === "requested" ? "Ride request sent" : activeRide.status === "started" ? "Driver is taking you to destination" : "Tracking your driver"}</strong>
          {activeRide.driver_name && activeRide.status !== "requested" && <span>Driver: {activeRide.driver_name}</span>}
          {activeRide.status === "requested" && <span>Waiting for an online driver to accept your request.</span>}
          {activeRide.status === "accepted" && <span>Driver is coming to your pickup location. Your OTP: <b>{otpExpired ? "Expired" : activeRide.otp_code || "Generating..."}</b>{otpSecondsLeft !== null && !otpExpired && ` (expires in ${Math.floor(otpSecondsLeft / 60)}:${String(otpSecondsLeft % 60).padStart(2, "0")})`}</span>}
          {activeRide.status === "arrived" && <span>Driver arrived. {otpExpired ? "Ask the driver to renew the OTP." : <>Share OTP: <b>{activeRide.otp_code || "Check your ride details"}</b></>}{otpSecondsLeft !== null && !otpExpired && ` (expires in ${Math.floor(otpSecondsLeft / 60)}:${String(otpSecondsLeft % 60).padStart(2, "0")})`}</span>}
          {activeRide.status === "started" && <span>Trip started after OTP verification. Destination route is live.</span>}
          {["requested", "accepted", "arrived"].includes(activeRide.status) && <div className="cancel-ride-box">
            <div className="cancel-ride-heading"><strong>Need to cancel?</strong><span>You can cancel before the trip starts.</span></div>
            <label htmlFor="cancel-reason">Reason for cancellation</label>
            <select id="cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)}>
              <option value="">Select a reason</option>
              <option value="Driver is taking too long">Driver is taking too long</option>
              <option value="I found another ride">I found another ride</option>
              <option value="Plans changed">Plans changed</option>
              <option value="Pickup location is incorrect">Pickup location is incorrect</option>
              <option value="Booked by mistake">Booked by mistake</option>
              <option value="Other">Other</option>
            </select>
            <button type="button" onClick={cancelRide} disabled={cancelling || !cancelReason}>{cancelling ? "Cancelling..." : "Cancel ride"}</button>
          </div>}
        </div>}
        {showBookingForm && <button className="book-ride-button" onClick={handleBookRide} disabled={loading || !destinationCoords}>{loading ? "Requesting..." : "Book Ride"}</button>}
      </div>
      <nav className="user-bottom-nav"><button className="nav-item active"><Car size={22} /><span>Ride</span></button><Link className="nav-item" to="/user/history"><Clock3 size={21} /><span>History</span></Link><Link className="nav-item" to="/user/profile"><UserCircle size={22} /><span>Profile</span></Link></nav>
    </div>
  );
};

export default Home;
