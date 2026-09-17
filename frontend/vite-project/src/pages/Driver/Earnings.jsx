// import React from "react";

// import {
//   Car,
//   Wallet,
//   UserCircle,
//   WalletCards,
// } from "lucide-react";

// import "./Dashboard.css";
// import "./Earnings.css";


// const Earnings = () => {

//   const earnings = {
//     totalEarned: 0,
//     wallet: 1635,
//     today: 0,
//     week: 0,
//     month: 0,
//   };


//   return (
//     <div className="driver-dashboard">


//       {/* =========================================
//           DESKTOP SIDEBAR
//           SAME AS DASHBOARD
//       ========================================= */}

//       <aside className="driver-sidebar">

//         <div className="driver-sidebar-logo">

//           <div className="driver-sidebar-logo-icon">
//             <Car size={22} />
//           </div>

//           <span>
//             VoltRide
//           </span>

//         </div>


//         <nav className="driver-sidebar-nav">

//           {/* Drive */}

//           <a
//             href="/driver/dashboard"
//             className="driver-sidebar-link"
//           >
//             <Car size={20} />

//             <span>
//               Drive
//             </span>
//           </a>


//           {/* Earnings - ACTIVE */}

//           <a
//             href="/driver/earnings"
//             className="driver-sidebar-link active"
//           >
//             <Wallet size={20} />

//             <span>
//               Earnings
//             </span>
//           </a>


//           {/* Profile */}

//           <a
//             href="/driver/profile"
//             className="driver-sidebar-link"
//           >
//             <UserCircle size={20} />

//             <span>
//               Profile
//             </span>
//           </a>

//         </nav>

//       </aside>



//       {/* =========================================
//           MAIN CONTENT
//       ========================================= */}

//       <main className="driver-main earnings-main">


//         {/* =========================================
//             EARNINGS HEADER
//         ========================================= */}

//         <section className="earnings-header">

//           <h1>
//             Earnings
//           </h1>

//           <p>
//             Your income summary
//           </p>

//         </section>



//         {/* =========================================
//             TOTAL EARNED CARD
//         ========================================= */}

//         <section className="total-earned-card">

//           <span className="total-earned-title">
//             Total Earned
//           </span>


//           <h2>
//             ₹{earnings.totalEarned}
//           </h2>


//           {/* Wallet */}

//           <div className="earnings-wallet">

//             <WalletCards size={13} />

//             <span>
//               Wallet: ₹{earnings.wallet}
//             </span>

//           </div>

//         </section>



//         {/* =========================================
//             EARNING SUMMARY
//         ========================================= */}

//         <section className="earning-summary">


//           {/* Today */}

//           <div className="earning-summary-card">

//             <span>
//               Today
//             </span>

//             <strong>
//               ₹{earnings.today}
//             </strong>

//           </div>



//           {/* Week */}

//           <div className="earning-summary-card">

//             <span>
//               Week
//             </span>

//             <strong>
//               ₹{earnings.week}
//             </strong>

//           </div>



//           {/* Month */}

//           <div className="earning-summary-card">

//             <span>
//               Month
//             </span>

//             <strong>
//               ₹{earnings.month}
//             </strong>

//           </div>


//         </section>



//         {/* =========================================
//             RECENT RIDES
//         ========================================= */}

//         <section className="recent-rides-section">

//           <h2>
//             Recent Rides
//           </h2>


//           <div className="no-rides">
//             No rides yet
//           </div>

//         </section>


//       </main>



//       {/* =========================================
//           MOBILE BOTTOM NAVIGATION
//           SAME AS DASHBOARD
//       ========================================= */}

//       <nav className="driver-mobile-nav">


//         {/* Drive */}

//         <a
//           href="/driver/dashboard"
//           className="driver-mobile-link"
//         >

//           <Car size={25} />

//           <span>
//             Drive
//           </span>

//         </a>



//         {/* Earnings - ACTIVE */}

//         <a
//           href="/driver/earnings"
//           className="driver-mobile-link active"
//         >

//           <Wallet size={25} />

//           <span>
//             Earnings
//           </span>

//         </a>



//         {/* Profile */}

//         <a
//           href="/driver/profile"
//           className="driver-mobile-link"
//         >

//           <UserCircle size={25} />

//           <span>
//             Profile
//           </span>

//         </a>


//       </nav>


//     </div>
//   );
// };


// export default Earnings;


import React, { useState, useEffect } from "react";
import {
  Car,
  Wallet,
  UserCircle,
  WalletCards,
} from "lucide-react";

import "./Dashboard.css";
import "./Earnings.css";

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    wallet: 0,
    today: 0,
    week: 0,
    month: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        // Backend Port 5000 maan kar chal rahe hain (apne backend port ke acc. badal sakte hain)
        const response = await fetch('http://localhost:5000/api/drivers/earnings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          setEarnings({
            totalEarned: data.totalEarned,
            wallet: data.wallet,
            today: data.today,
            week: data.week,
            month: data.month,
          });
          setRecentRides(data.recentRides || []);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  return (
    <div className="driver-dashboard">
      {/* DESKTOP SIDEBAR */}
      <aside className="driver-sidebar">
        <div className="driver-sidebar-logo">
          <div className="driver-sidebar-logo-icon">
            <Car size={22} />
          </div>
          <span>VoltRide</span>
        </div>

        <nav className="driver-sidebar-nav">
          <a href="/driver/dashboard" className="driver-sidebar-link">
            <Car size={20} />
            <span>Drive</span>
          </a>
          <a href="/driver/earnings" className="driver-sidebar-link active">
            <Wallet size={20} />
            <span>Earnings</span>
          </a>
          <a href="/driver/profile" className="driver-sidebar-link">
            <UserCircle size={20} />
            <span>Profile</span>
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="driver-main earnings-main">
        <section className="earnings-header">
          <h1>Earnings</h1>
          <p>Your income summary</p>
        </section>

        {/* TOTAL EARNED CARD */}
        <section className="total-earned-card">
          <span className="total-earned-title">Total Earned</span>
          <h2>₹{loading ? "..." : earnings.totalEarned}</h2>

          <div className="earnings-wallet">
            <WalletCards size={13} />
            <span>Wallet: ₹{loading ? "..." : earnings.wallet}</span>
          </div>
        </section>

        {/* EARNING SUMMARY */}
        <section className="earning-summary">
          <div className="earning-summary-card">
            <span>Today</span>
            <strong>₹{loading ? "..." : earnings.today}</strong>
          </div>
          <div className="earning-summary-card">
            <span>Week</span>
            <strong>₹{loading ? "..." : earnings.week}</strong>
          </div>
          <div className="earning-summary-card">
            <span>Month</span>
            <strong>₹{loading ? "..." : earnings.month}</strong>
          </div>
        </section>

        {/* RECENT RIDES */}
        <section className="recent-rides-section">
          <h2>Recent Rides</h2>

          {loading ? (
            <div className="no-rides">Loading data...</div>
          ) : recentRides.length === 0 ? (
            <div className="no-rides">No rides yet</div>
          ) : (
            <div className="recent-rides-list">
              {recentRides.map((ride) => (
                <div key={ride.id} className="ride-item">
                  <div className="ride-info">
                    {/* DB column names: pickup -> destination */}
                    <p className="ride-route">{ride.pickup} → {ride.destination}</p>
                    <span className="ride-status" style={{ color: '#059669', fontSize: '12px', textTransform: 'capitalize' }}>
                      {ride.status}
                    </span>
                  </div>
                  <div className="ride-amount">
                    +₹{ride.fare}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="driver-mobile-nav">
        <a href="/driver/dashboard" className="driver-mobile-link">
          <Car size={25} />
          <span>Drive</span>
        </a>
        <a href="/driver/earnings" className="driver-mobile-link active">
          <Wallet size={25} />
          <span>Earnings</span>
        </a>
        <a href="/driver/profile" className="driver-mobile-link">
          <UserCircle size={25} />
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default Earnings;

