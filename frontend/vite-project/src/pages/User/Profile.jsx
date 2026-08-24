import React from "react";

import {
    CreditCard,
    Star,
    Gift,
    Bell,
    CircleHelp,
    Leaf,
    ChevronRight,
    Car,
    Clock3,
    UserCircle,
    LogOut
} from "lucide-react";

import "./Profile.css";


const Profile = () => {

    // Profile data
    const user = {
        name: "Demo Rider",
        email: "user@voltride.com"
    };


    const profileOptions = [

        {
            icon: CreditCard,
            title: "Payment Methods",
            subtitle: "Manage cards, UPI & wallets"
        },

        {
            icon: Star,
            title: "Favorite Places",
            subtitle: "Home, work & more"
        },

        {
            icon: Gift,
            title: "Refer & Earn",
            subtitle: "Get ₹100 per referral"
        },

        {
            icon: Bell,
            title: "Notifications",
            subtitle: "Manage alerts"
        },

        {
            icon: CircleHelp,
            title: "Help & Support",
            subtitle: "FAQs & contact us"
        },

        {
            icon: Leaf,
            title: "CO₂ Impact",
            subtitle: "View your green impact"
        }

    ];


    const handleOptionClick = (title) => {

        console.log(`${title} clicked`);

    };


    const handleSignOut = () => {

        console.log("User signed out");

        // Later:
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");

    };


    return (

        <div className="user-profile-page">


            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <section className="profile-header">

                <div className="profile-avatar">
                    D
                </div>


                <h1>
                    {user.name}
                </h1>


                <p>
                    {user.email}
                </p>

            </section>



            {/* =================================================
                PROFILE OPTIONS
            ================================================= */}

            <main className="profile-content">

                <div className="profile-options">


                    {profileOptions.map((item, index) => {

                        const Icon = item.icon;

                        return (

                            <button
                                className="profile-option"
                                key={index}
                                onClick={() =>
                                    handleOptionClick(item.title)
                                }
                            >

                                {/* Icon */}

                                <div className="profile-option-icon">

                                    <Icon size={18} />

                                </div>


                                {/* Text */}

                                <div className="profile-option-content">

                                    <span className="profile-option-title">
                                        {item.title}
                                    </span>

                                    <span className="profile-option-subtitle">
                                        {item.subtitle}
                                    </span>

                                </div>


                                {/* Arrow */}

                                <ChevronRight
                                    className="profile-option-arrow"
                                    size={21}
                                />

                            </button>

                        );

                    })}


                </div>



                {/* =================================================
                    SIGN OUT
                ================================================= */}

                <button
                    className="profile-signout"
                    onClick={handleSignOut}
                >

                    <LogOut size={16} />

                    <span>
                        Sign Out
                    </span>

                </button>

            </main>



            {/* =================================================
                BOTTOM NAVIGATION
            ================================================= */}

            <nav className="user-profile-bottom-nav">


                {/* Ride */}

                <button
                    className="profile-nav-item"
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

                <button
                    className="profile-nav-item"
                >

                    <Clock3 size={21} />

                    <span>
                        History
                    </span>

                </button>



                {/* Profile */}

                <button
                    className="profile-nav-item active"
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


export default Profile;