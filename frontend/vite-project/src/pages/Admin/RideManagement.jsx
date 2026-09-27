import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

import "./RideManagement.css";

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get("/api/admin/rides");

        if (response.data?.success) {
          setRides(response.data.rides || []);
        }
      } catch (error) {
        console.error("Admin rides fetch error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  return (
    <AdminLayout>
      <div className="ride-management-page">
        <header className="rides-header">
          <h1>All Rides</h1>
          <p>{rides.length} total bookings</p>
        </header>

        <main className="rides-content">
          {loading ? (
            <p>Loading rides...</p>
          ) : rides.length === 0 ? (
            <p>No rides yet</p>
          ) : (
            <div className="rides-list">
              {rides.map((ride) => (
                <div key={ride.id} className="ride-card">
                  <div className="ride-card-header">
                    <div>
                      <strong>Ride #{ride.id}</strong>
                      <small>{new Date(ride.created_at).toLocaleDateString()}</small>
                    </div>
                    <span className={`ride-status ${ride.status?.toLowerCase()}`}>{ride.status}</span>
                  </div>

                  <div className="ride-route">
                    <div><span>From</span><strong>{ride.pickup || "-"}</strong></div>
                    <div><span>To</span><strong>{ride.destination || "-"}</strong></div>
                  </div>

                  <div className="ride-card-details">
                    <p><span>User</span>{ride.user_name || "Unknown"}</p>
                    <p><span>Vehicle</span>{ride.vehicle_model || "-"}</p>
                    <p><span>Distance</span>{ride.distance ?? 0} km</p>
                    <p><span>Fare</span>₹{Number(ride.fare || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
};

export default RideManagement;