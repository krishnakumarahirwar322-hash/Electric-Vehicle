import React from "react";
import {
    Car,
    Clock3,
    UserCircle
} from "lucide-react";

import "./History.css";


const History = () => {

    // Backend connect hone ke baad
    // ye data API se aayega.
    const rides = [];


    return (

        <div className="history-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="history-header">

                <h1>
                    My Rides
                </h1>

                <p>
                    {rides.length} total trips
                </p>

            </header>



            {/* =================================================
                RIDE CONTENT
            ================================================= */}

            <main className="history-content">


                {rides.length === 0 ? (

                    /* =========================================
                       EMPTY STATE
                    ========================================= */

                    <div className="history-empty">

                        <div className="empty-car">

                            <Car size={43} />

                        </div>


                        <h2>
                            No rides yet
                        </h2>


                        <p>
                            Book your first EV ride from the Ride tab
                        </p>

                    </div>

                ) : (

                    /* =========================================
                       RIDES
                    ========================================= */

                    <div className="rides-list">

                        {rides.map((ride) => (

                            <div
                                className="ride-history-card"
                                key={ride.id}
                            >

                                <div className="ride-card-top">

                                    <div>

                                        <h3>
                                            {ride.pickup}
                                        </h3>

                                        <p>
                                            → {ride.destination}
                                        </p>

                                    </div>


                                    <span className="ride-status">
                                        Completed
                                    </span>

                                </div>


                                <div className="ride-card-bottom">

                                    <span>
                                        {ride.date}
                                    </span>

                                    <span>
                                        ₹{ride.fare}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>



            {/* =================================================
                BOTTOM NAVIGATION
            ================================================= */}

            <nav className="history-bottom-nav">


                {/* Ride */}

                <button
                    className="history-nav-item"
                    onClick={() => {
                        window.location.href = "/user/home";
                    }}
                >

                    <Car size={21} />

                    <span>
                        Ride
                    </span>

                </button>



                {/* History */}

                <button className="history-nav-item active">

                    <Clock3 size={21} />

                    <span>
                        History
                    </span>

                </button>



                {/* Profile */}

                <button
                    className="history-nav-item"
                    onClick={() => {
                        window.location.href = "/user/profile";
                    }}
                >

                    <UserCircle size={21} />

                    <span>
                        Profile
                    </span>

                </button>


            </nav>


        </div>

    );

};


export default History;