// import React from "react";
// import { Check } from "lucide-react";

// import "./DriverCard.css";

// const DriverCard = ({ driver, onApprove }) => {
//   const isPending = driver.status === "pending";

//   return (
//     <div className="driver-card">

//       {/* =========================
//           DRIVER TOP SECTION
//       ========================= */}

//       <div className="driver-main-info">

//         {/* Avatar */}
//         <div className="driver-avatar">
//           {driver.name.charAt(0).toUpperCase()}
//         </div>


//         {/* Driver Details */}
//         <div className="driver-details">

//           <h3>
//             {driver.name}
//           </h3>

//           <p className="driver-email">
//             {driver.email}
//           </p>

//           <p className="driver-vehicle">
//             {driver.vehicle} • {driver.registrationNumber}
//           </p>

//         </div>


//         {/* Status */}
//         <div
//           className={`driver-status ${
//             isPending ? "pending" : "approved"
//           }`}
//         >
//           {isPending ? "PENDING" : "APPROVED"}
//         </div>

//       </div>


//       {/* =========================
//           DRIVER STATS
//       ========================= */}

//       <div className="driver-stats">

//         <div className="driver-rating">
//           <span>★</span>

//           <strong>
//             {driver.rating}
//           </strong>
//         </div>


//         <div className="driver-rides">
//           {driver.rides} rides
//         </div>


//         <div className="driver-online">

//           <span></span>

//           {driver.online ? "Online" : "Offline"}

//         </div>

//       </div>


//       {/* =========================
//           APPROVE BUTTON
//       ========================= */}

//       {isPending && (
//         <button
//           className="approve-driver-btn"
//           onClick={() => onApprove(driver.id)}
//         >

//           <Check size={16} />

//           <span>
//             Approve
//           </span>

//         </button>
//       )}

//     </div>
//   );
// };

// export default DriverCard;

import React from "react";
import { Check } from "lucide-react";

import "./DriverCard.css";


const DriverCard = ({ driver, onApprove }) => {
  const isPending = !driver.status || driver.status.toLowerCase() === "pending";
  
  // Name ka pehla letter Avatar ke liye
  const avatarLetter = driver.name ? driver.name.charAt(0).toUpperCase() : "D";

  return (
    <div className="driver-card">
      {/* Top Section: Avatar, Info, Status Badge */}
      <div className="driver-card-header">
        <div className="driver-avatar">{avatarLetter}</div>
        
        <div className="driver-info">
          <h4>{driver.name || "Unknown Driver"}</h4>
          <span className="driver-email">{driver.email || "No email provided"}</span>
          <p className="driver-vehicle">
            {driver.vehicle || "EV Vehicle"} • {driver.registrationNumber || driver.license_no || "N/A"}
          </p>
        </div>

        <span className={`status-badge ${driver.status?.toLowerCase() || "pending"}`}>
          {driver.status?.toUpperCase() || "PENDING"}
        </span>
      </div>

      {/* Stats Section: Rating, Rides, Online Status */}
      <div className="driver-card-stats">
        <span>★ {driver.rating || "4.5"}</span>
        <span>{driver.rides || 0} rides</span>
        <span className="online-status">● Online</span>
      </div>

      {/* Bottom Action: Approve Button */}
      {isPending && (
        <button className="approve-btn" onClick={() => onApprove(driver.id)}>
          ✓ Approve
        </button>
      )}
    </div>
  );
};

export default DriverCard;
