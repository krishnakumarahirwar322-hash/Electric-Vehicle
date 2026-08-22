import React from "react";

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

  const driver = {
    name: "Ravi",
    vehicle: "Tata Nexon EV",
    vehicleNumber: "KA01EV1234",
    totalRides: 94,
    rating: 4.7,
    wallet: 1635,
  };


  const handleGoOffline = () => {
    console.log("Driver going offline");
  };


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

          <a
            href="/driver/dashboard"
            className="driver-sidebar-link active"
          >
            <Car size={20} />
            <span>Drive</span>
          </a>


          <a
            href="/driver/earnings"
            className="driver-sidebar-link"
          >
            <Wallet size={20} />
            <span>Earnings</span>
          </a>


          <a
            href="/driver/profile"
            className="driver-sidebar-link"
          >
            <UserCircle size={20} />
            <span>Profile</span>
          </a>

        </nav>

      </aside>



      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="driver-main">


        {/* =========================================
            TOP STATUS AREA
        ========================================= */}

        <section className="driver-map-area">

          {/* Fake map/grid background */}

          <div className="driver-map-grid"></div>


          {/* Today's earning */}

          <div className="today-earning">

            <Wallet size={19} />

            <span>
              Today: ₹0
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


          {/* Greeting */}

          <div className="driver-greeting">

            <h1>
              Hello, {driver.name}
            </h1>

            <p>
              {driver.vehicle} • {driver.vehicleNumber}
            </p>

          </div>



          {/* =========================================
              STAT CARDS
          ========================================= */}

          <div className="driver-stat-grid">


            {/* Total Rides */}

            <div className="driver-stat-card">

              <div className="driver-stat-icon ride-icon">
                <Car size={23} />
              </div>

              <strong>
                {driver.totalRides}
              </strong>

              <span>
                Total Rides
              </span>

            </div>



            {/* Rating */}

            <div className="driver-stat-card">

              <div className="driver-stat-icon rating-icon">
                <Star
                  size={23}
                  fill="currentColor"
                />
              </div>

              <strong>
                {driver.rating}
              </strong>

              <span>
                Rating
              </span>

            </div>



            {/* Wallet */}

            <div className="driver-stat-card">

              <div className="driver-stat-icon wallet-icon">
                <Wallet size={23} />
              </div>

              <strong>
                ₹{driver.wallet}
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


        <a
          href="/driver/dashboard"
          className="driver-mobile-link active"
        >

          <Car size={25} />

          <span>
            Drive
          </span>

        </a>


        <a
          href="/driver/earnings"
          className="driver-mobile-link"
        >

          <Wallet size={25} />

          <span>
            Earnings
          </span>

        </a>


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