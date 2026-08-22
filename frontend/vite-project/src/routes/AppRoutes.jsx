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

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={
            <Navigate to="/admin/dashboard" />
           } 
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


        {/* Unknown URL */}

        <Route
          path="*"
          element={
            <Navigate to="/admin/dashboard" />
          }
        />



        {/* =========================
            DRIVER
        ========================= */}

        <Route
          path="/driver/dashboard"
          element={<DriverDashboard />}
        />


      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;