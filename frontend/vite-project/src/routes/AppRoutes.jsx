import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
}
 from "react-router-dom";

import Dashboard from "../pages/Admin/Dashboard";
import DriverManagement from "../pages/Admin/DriverManagement";
import RideManagement from "../pages/Admin/RideManagement";
import Settings from "../pages/Admin/Settings";

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

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;