import React, { useEffect, useState } from "react";
import { Car, Clock3, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./History.css";

const History = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingRide, setPayingRide] = useState(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;
    api.post("/api/payments/stripe-confirm", { session_id: sessionId })
      .then(() => window.history.replaceState({}, "", "/user/history"))
      .then(() => api.get("/api/rides/my-rides").then((response) => setRides(response.data?.rides || [])))
      .catch((error) => window.alert(error.response?.data?.message || "Stripe payment verification failed"));
  }, []);

  const payForRide = async (ride) => {
    setPayingRide(ride.id);
    try {
      const response = await api.post("/api/payments/stripe-checkout", { ride_id: ride.id });
      window.location.href = response.data.checkoutUrl;
    } catch (paymentError) {
      window.alert(paymentError.response?.data?.message || "Payment failed");
    } finally { setPayingRide(null); }
  };

  useEffect(() => {
    api.get("/api/rides/my-rides")
      .then((response) => setRides(response.data?.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-page">
      <header className="history-header">
        <h1>My Rides</h1>
        <p>{rides.length} total trips</p>
      </header>
      <main className="history-content">
        {loading ? (
          <div className="history-empty"><p>Loading rides...</p></div>
        ) : rides.length === 0 ? (
          <div className="history-empty">
            <div className="empty-car"><Car size={43} /></div>
            <h2>No rides yet</h2>
            <p>Book your first EV ride from the Ride tab</p>
          </div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <div className="ride-history-card" key={ride.id}>
                <div className="ride-card-top">
                  <div>
                    <h3>{ride.pickup}</h3>
                    <p>to {ride.destination}</p>
                  </div>
                  <span className={`ride-status ${ride.status}`}>{ride.status}</span>
                </div>
                <div className="ride-card-bottom">
                  <span>{ride.created_at ? new Date(ride.created_at).toLocaleString() : "Recent"}</span>
                  <strong>Rs. {Number(ride.fare || 0).toFixed(2)}</strong>
                </div>
                {ride.status === "completed" && ride.payment_status !== "paid" && <button className="ride-pay-button" onClick={() => payForRide(ride)} disabled={payingRide === ride.id}>{payingRide === ride.id ? "Paying..." : "Pay online"}</button>}
                {ride.payment_status === "paid" && <small className="ride-paid-label">Paid {ride.payment_method ? `via ${ride.payment_method}` : ""}</small>}
              </div>
            ))}
          </div>
        )}
      </main>
      <nav className="history-bottom-nav">
        <Link className="history-nav-item" to="/user/home"><Car size={21} /><span>Ride</span></Link>
        <button className="history-nav-item active"><Clock3 size={21} /><span>History</span></button>
        <Link className="history-nav-item" to="/user/profile"><UserCircle size={21} /><span>Profile</span></Link>
      </nav>
    </div>
  );
};

export default History;
