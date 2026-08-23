import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
}
 from "react-router-dom";

 import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

import Dashboard from "../pages/Admin/Dashboard";
import DriverManagement from "../pages/Admin/DriverManagement";
import RideManagement from "../pages/Admin/RideManagement";
import Settings from "../pages/Admin/Settings";


/* Driver */
import DriverDashboard from "../pages/Driver/Dashboard";
import Profile from "../pages/Driver/Profile";


import { Users } from "lucide-react";


// Users

import UserProfile from "../pages/User/Profile";
import Home from "../pages/User/Home";
import History from "../pages/User/History";


const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* Default */}
        <Route
          path="/login"
          element={<Login />}
        />

         {/* =================================
            AUTH
        ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Signup />}
        />



        {/* =================================
            DEFAULT
        ================================= */}

        <Route
          path="/"
          element={
            <Navigate to="/login" />
          }
        />

        {/* =================================
            UNKNOWN
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate to="/login" />
          }
        />


        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />


        {/* Drivers */}

        <Route
          path="/admin/drivers"
          element={<DriverManagement />}
        />

         {/* Rides */}
        <Route
          path="/admin/rides"
          element={<RideManagement />}
        />



  {/* Setting */}
        <Route
  path="/admin/settings"
  element={<Settings />}
    />




        {/* =========================
            DRIVER
        ========================= */}

        <Route
          path="/driver/dashboard"
          element={<DriverDashboard />}
        />

      <Route path="/driver/profile" 
      element={<Profile />} />


       {/* user */}

      <Route path="/user/home" element={<Home />} />
      
     <Route   path="/user/profile"  element={<UserProfile />}/>

     <Route  path="/user/history"   element={<History />} />
     
     
      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;