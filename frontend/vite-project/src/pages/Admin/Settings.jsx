import React from "react";

import {
  ShieldCheck,
  LogOut,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

import "./Settings.css";


const Settings = () => {

  // Registered users
  const users = [
    {
      id: 1,
      name: "Demo Rider",
      email: "user@voltride.com",
    },
    {
      id: 2,
      name: "Krishna Kumar ahirwar",
      email: "krishnakumarahirwar322@gmail.com",
    },
  ];


  // Sign out
  const handleSignOut = () => {
    console.log("Admin signed out");

    // Later:
    // localStorage.removeItem("token");
    // navigate("/login");
  };


  return (
    <AdminLayout>

      <div className="settings-page">


        {/* =================================
            ADMIN PROFILE
        ================================= */}

        <section className="admin-profile-card">

          <div className="admin-icon">

            <ShieldCheck
              size={30}
              strokeWidth={2.5}
            />

          </div>


          <h1>
            Admin
          </h1>


          <p>
            admin@voltride.com
          </p>

        </section>



        {/* ================================
            REGISTERED USERS
        ================================= */}

        <section className="registered-users-card">

          <h2>
            Registered Users ({users.length})
          </h2>


          <div className="users-list">

            {users.map((user) => (

              <div
                className="registered-user"
                key={user.id}
              >

                {/* Avatar */}

                <div className="user-avatar">

                  {user.name
                    .charAt(0)
                    .toUpperCase()}

                </div>


                {/* User Information */}

                <div className="user-information">

                  <h3>
                    {user.name}
                  </h3>

                  <p>
                    {user.email}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>



        {/* =================================
            SIGN OUT
        ================================= */}

        <button
          className="sign-out-button"
          onClick={handleSignOut}
        >

          <LogOut
            size={15}
            strokeWidth={2.5}
          />

          <span>
            Sign Out
          </span>

        </button>


      </div>

    </AdminLayout>
  );
};


export default Settings;