import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
}
 from "react-router-dom";

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


import UserProfile from "../pages/User/Profile";
import Home from "../pages/User/Home";
import History from "../pages/User/History";
import UserLayout from "../layouts/UserLayout";


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
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/driver/register"
          element={<DriverRegister />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
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

       <Route
          path="/driver/earnings"
          element={<Earnings/>}
        />


       {/* user */}

       <Route path="/user/home" element={<UserLayout><Home /></UserLayout>} />
      
    <Route path="/user/profile" element={<UserLayout><UserProfile /></UserLayout>} />

    <Route path="/user/history" element={<UserLayout><History /></UserLayout>} />
      
     
      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;