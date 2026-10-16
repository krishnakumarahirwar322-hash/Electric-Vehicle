import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import DriverRegister from "../pages/Auth/DriverRegister";

import Dashboard from "../pages/Admin/Dashboard";
import DriverManagement from "../pages/Admin/DriverManagement";
import RideManagement from "../pages/Admin/RideManagement";
import Settings from "../pages/Admin/Settings";

/* Driver */
import DriverDashboard from "../pages/Driver/Dashboard";
import Profile from "../pages/Driver/Profile";
import Earnings from "../pages/Driver/Earnings";

/* User */
import UserProfile from "../pages/User/Profile";
import Home from "../pages/User/Home";
import History from "../pages/User/History";
import UserLayout from "../layouts/UserLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/drivers" element={<DriverManagement />} />
        <Route path="/admin/rides" element={<RideManagement />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Driver Routes */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/profile" element={<Profile />} />
        <Route path="/driver/earnings" element={<Earnings />} />

        {/* User Routes */}
        <Route path="/user/home" element={<UserLayout><Home /></UserLayout>} />
        {/* Agar UserLayout mein bhi nav bar hai, toh UserProfile ko bina layout ke bhi try kar sakte hain */}
        <Route path="/user/profile" element={<UserLayout><UserProfile /></UserLayout>} />
        <Route path="/user/history" element={<UserLayout><History /></UserLayout>} />

        {/* Catch-all Wildcard Route (ALWAYS AT THE VERY END) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;