import React, { useState } from "react";
import {
    MapPin,
    Navigation,
    WalletCards,
    Smartphone,
    CreditCard,
    Car,
    Clock3,
    UserCircle,
    CircleDot,
    Square,
} from "lucide-react";

import "./Home.css";


const Home = () => {

    const [payment, setPayment] = useState("cash");


    return (

        <div className="user-home">


            {/* =================================================
                MAP AREA
            ================================================= */}

            <div className="map-area">


                {/* Greeting */}

                <div className="greeting-card">

                    <div className="greeting-title">
                        Hi there! 👋
                    </div>

                    <div className="greeting-subtitle">
                        Book your electric ride
                    </div>

                </div>


                {/* Current Location */}

                <div className="current-location">

                    <div className="location-pulse">

                        <div className="location-dot">
                        </div>

                    </div>

                </div>


                {/* Optional map control */}

                <button className="map-location-button">

                    <Navigation size={18} />

                </button>

            </div>



            {/* =================================================
                BOOKING PANEL
            ================================================= */}

            <div className="booking-panel">


                {/* Drag handle */}

                <div className="drag-handle">
                </div>


                {/* Heading */}

                <h1 className="where-title">
                    Where to?
                </h1>



                {/* =================================================
                    LOCATION SECTION
                ================================================= */}

                <div className="location-section">


                    {/* Pickup */}

                    <div className="location-row">

                        <div className="location-icon pickup-icon">

                            <CircleDot size={13} />

                        </div>


                        <div className="location-content">

                            <span className="location-label">
                                PICKUP
                            </span>

                            <span className="location-value">
                                Current Location
                            </span>

                        </div>

                    </div>



                    {/* Divider */}

                    <div className="location-divider">
                    </div>



                    {/* Drop */}

                    <div className="location-row">

                        <div className="location-icon drop-icon">

                            <Square size={11} fill="currentColor" />

                        </div>


                        <div className="location-content">

                            <span className="location-label">
                                DROP
                            </span>

                            <span className="location-value drop-value">
                                Select destination
                            </span>

                        </div>

                    </div>

                </div>



                {/* =================================================
                    PAYMENT
                ================================================= */}

                <div className="payment-section">

                    <h3>
                        Payment
                    </h3>


                    <div className="payment-options">


                        {/* Cash */}

                        <button
                            className={`payment-button ${
                                payment === "cash"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => setPayment("cash")}
                        >

                            <WalletCards size={16} />

                            <span>
                                CASH
                            </span>

                        </button>



                        {/* UPI */}

                        <button
                            className={`payment-button ${
                                payment === "upi"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => setPayment("upi")}
                        >

                            <Smartphone size={16} />

                            <span>
                                UPI
                            </span>

                        </button>



                        {/* Card */}

                        <button
                            className={`payment-button ${
                                payment === "card"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => setPayment("card")}
                        >

                            <CreditCard size={16} />

                            <span>
                                CARD
                            </span>

                        </button>

                    </div>

                </div>



                {/* =================================================
                    BOOK RIDE BUTTON
                ================================================= */}

                <button
                    className="book-ride-button"
                    disabled
                >

                    Book Ride

                </button>


            </div>



            {/* =================================================
                BOTTOM NAVIGATION
            ================================================= */}

            <nav className="user-bottom-nav">


                {/* Ride */}

                <button className="nav-item active">

                    <Car size={23} />

                    <span>
                        Ride
                    </span>

                </button>



                {/* History */}

                <button className="nav-item">

                    <Clock3 size={22} />

                    <span>
                        History
                    </span>

                </button>



                {/* Profile */}

                <button className="nav-item">

                    <UserCircle size={23} />

                    <span>
                        Profile
                    </span>

                </button>


            </nav>


        </div>

    );

};


export default Home;