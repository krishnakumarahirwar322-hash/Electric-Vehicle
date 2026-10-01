import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import api from "../../services/api";
import { clearAuthSession } from "../../services/authSession";

import "./Profile.css";


const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "", email: "", phone: "" });
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/users/profile")
            .then((response) => {
                const profile = response.data.user;
                setUser(profile);
                setForm({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" });
            })
            .catch((requestError) => setError(requestError.response?.data?.message || "Profile could not be loaded."))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true); setError(""); setMessage("");
        try {
            const response = await api.put("/api/users/profile", form);
            const updated = response.data.user;
            setUser(updated); setForm({ name: updated.name, email: updated.email, phone: updated.phone || "" });
            localStorage.setItem("user", JSON.stringify(updated));
            setEditing(false); setMessage("Profile updated successfully.");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Profile update failed.");
        } finally { setSaving(false); }
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
        clearAuthSession();
        navigate("/login");

    };


    return (

        <div className="user-profile-page">


            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <section className="profile-header">

                <div className="profile-avatar">
                    {(user.name || "U").charAt(0).toUpperCase()}
                </div>


                <h1>
                    {loading ? "Loading profile..." : user.name}
                </h1>


                <p>
                    {user.email}
                </p>

            </section>



            {/* =================================================
                PROFILE OPTIONS
            ================================================= */}

            <main className="profile-content">

                <section className="profile-edit-card">
                    <div className="profile-edit-heading"><div><h2>Personal information</h2><p>Keep your account details up to date.</p></div><button type="button" onClick={() => { setEditing((value) => !value); setError(""); }}>{editing ? "Cancel" : "Edit"}</button></div>
                    {editing ? (
                        <form className="profile-edit-form" onSubmit={handleSave}>
                            <label>Name<input name="name" value={form.name} onChange={handleChange} required /></label>
                            <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
                            <label>Phone<input type="tel" name="phone" value={form.phone} onChange={handleChange} required /></label>
                            <button className="profile-save-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                        </form>
                    ) : (
                        <div className="profile-details"><span>{user.email}</span><span>{user.phone || "No phone added"}</span></div>
                    )}
                    {error && <p className="profile-feedback error">{error}</p>}{message && <p className="profile-feedback success">{message}</p>}
                </section>

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