import React from "react";
import { Check } from "lucide-react";

import "./DriverCard.css";

const DriverCard = ({ driver, onApprove }) => {
  const isPending = driver.status === "pending";

  return (
    <div className="driver-card">

      {/* =========================
          DRIVER TOP SECTION
      ========================= */}

      <div className="driver-main-info">

        {/* Avatar */}
        <div className="driver-avatar">
          {driver.name.charAt(0).toUpperCase()}
        </div>


        {/* Driver Details */}
        <div className="driver-details">

          <h3>
            {driver.name}
          </h3>

          <p className="driver-email">
            {driver.email}
          </p>

          <p className="driver-vehicle">
            {driver.vehicle} • {driver.registrationNumber}
          </p>

        </div>


        {/* Status */}
        <div
          className={`driver-status ${
            isPending ? "pending" : "approved"
          }`}
        >
          {isPending ? "PENDING" : "APPROVED"}
        </div>

      </div>


      {/* =========================
          DRIVER STATS
      ========================= */}

      <div className="driver-stats">

        <div className="driver-rating">
          <span>★</span>

          <strong>
            {driver.rating}
          </strong>
        </div>


        <div className="driver-rides">
          {driver.rides} rides
        </div>


        <div className="driver-online">

          <span></span>

          {driver.online ? "Online" : "Offline"}

        </div>

      </div>


      {/* =========================
          APPROVE BUTTON
      ========================= */}

      {isPending && (
        <button
          className="approve-driver-btn"
          onClick={() => onApprove(driver.id)}
        >

          <Check size={16} />

          <span>
            Approve
          </span>

        </button>
      )}

    </div>
  );
};

export default DriverCard;