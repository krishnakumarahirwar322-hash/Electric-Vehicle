import React from "react";

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

  const driver = {
    name: "Ravi Kumar",
    email: "ravi@voltride.com",
    phone: "+918791829444",

    rating: 4.7,
    totalRides: 94,

    vehicle: "Tata Nexon EV",
    vehicleNumber: "KA01EV1234",
    license: "DL9942767",

    status: "Approved",
  };


  const handleLogout = () => {
    console.log("Driver logout");
  };


  return (
    <div className="driver-profile-page">


      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside className="driver-profile-sidebar">

        {/* Logo */}

        <div className="driver-profile-logo">

          <div className="driver-profile-logo-icon">
            <Car size={21} />
          </div>

          <span>
            VoltRide
          </span>

        </div>


        {/* Navigation */}

        <nav className="driver-profile-sidebar-nav">

          <a
            href="/driver/dashboard"
            className="driver-profile-side-link"
          >
            <Car size={20} />
            <span>Drive</span>
          </a>


          <a
            href="/driver/earnings"
            className="driver-profile-side-link"
          >
            <Wallet size={20} />
            <span>Earnings</span>
          </a>


          <a
            href="/driver/profile"
            className="driver-profile-side-link active"
          >
            <UserCircle size={20} />
            <span>Profile</span>
          </a>

        </nav>

      </aside>



      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="driver-profile-main">


        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="driver-profile-header">

          {/* Avatar */}

          <div className="driver-profile-avatar">
            R
          </div>


          {/* Name */}

          <h1>
            {driver.name}
          </h1>


          {/* Rating */}

          <div className="driver-profile-rating">

            <Star
              size={22}
              fill="currentColor"
            />

            <span>
              {driver.rating}
            </span>

            <span>
              •
            </span>

            <span>
              {driver.totalRides} rides
            </span>

          </div>

        </section>



        {/* =================================================
            PROFILE CONTENT
        ================================================= */}

        <section className="driver-profile-content">


          {/* =================================================
              VEHICLE
          ================================================= */}

          <div className="driver-profile-card">

            <h2>
              Vehicle
            </h2>


            <div className="driver-profile-row">

              <Car size={27} />

              <span>
                {driver.vehicle}
              </span>

            </div>


            <div className="driver-profile-row">

              <Tag size={27} />

              <span>
                {driver.vehicleNumber}
              </span>

            </div>


            <div className="driver-profile-row">

              <FileText size={27} />

              <span>
                License: {driver.license}
              </span>

            </div>

          </div>



          {/* =================================================
              CONTACT
          ================================================= */}

          <div className="driver-profile-card">

            <h2>
              Contact
            </h2>


            <div className="driver-profile-row">

              <Mail size={27} />

              <span>
                {driver.email}
              </span>

            </div>


            <div className="driver-profile-row">

              <Phone size={27} />

              <span>
                {driver.phone}
              </span>

            </div>

          </div>



          {/* =================================================
              ACCOUNT STATUS
          ================================================= */}

          <div className="driver-account-status">

            <h2>
              Account Status
            </h2>


            <div className="driver-status-row">

              <CheckCircle size={27} />

              <span>
                {driver.status} ✓
              </span>

            </div>

          </div>



          {/* =================================================
              SIGN OUT
          ================================================= */}

          <button
            className="driver-signout-button"
            onClick={handleLogout}
          >

            <LogOut size={20} />

            <span>
              Sign Out
            </span>

          </button>


        </section>

      </main>



      {/* =================================================
          MOBILE BOTTOM NAVIGATION
      ================================================= */}

      <nav className="driver-profile-mobile-nav">


        <a
          href="/driver/dashboard"
          className="driver-profile-mobile-link"
        >

          <Car size={25} />

          <span>
            Drive
          </span>

        </a>


        <a
          href="/driver/earnings"
          className="driver-profile-mobile-link"
        >

          <Wallet size={25} />

          <span>
            Earnings
          </span>

        </a>


        <a
          href="/driver/profile"
          className="driver-profile-mobile-link active"
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


export default Profile;