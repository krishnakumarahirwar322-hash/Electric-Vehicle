import { useEffect, useState } from "react";

import {
  Users,
  Car,
  Activity,
  Wallet,
  CheckCircle,
  XCircle,
  Leaf,
  Zap,
  Motorbike
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

import "./Dashboard.css";


const Dashboard = () => {

  // ================= DASHBOARD STATE =================

  const [dashboard, setDashboard] = useState({
  total_users: 0,
  total_drivers: 0,
  total_rides: 0,
  active_rides: 0,
  completed_rides: 0,
  cancel_rides: 0,
  total_revenue: 0,
  total_available_charging_ports: 0,
});

  const [lastSevenDays, setLastSevenDays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");


  // ================= GET DASHBOARD DATA =================

  const getDashboardStats = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await api.get("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      console.log(
        "ADMIN DASHBOARD RESPONSE:",
        response.data
      );


      // ================= SET DASHBOARD DATA =================

      if (response.data?.dashboard) {

        setDashboard(response.data.dashboard);

      }

      setLastSevenDays(response.data?.lastSevenDays || []);


      console.log(
        "Admin Dashboard Connected ✅"
      );

    } catch (error) {

      console.error(
        "Admin Dashboard Connection Failed ❌"
      );

      console.error(
        error.response?.data || error.message
      );
      if (error.response?.status === 403) {
        setLoadError("This account does not have admin access. Sign out and sign in with your admin account. A driver application does not grant admin privileges.");
      } else if (error.response?.status === 401) {
        setLoadError("Your session has expired. Sign in again with your admin account.");
      } else {
        setLoadError(error.response?.data?.message || "Admin dashboard could not be loaded. Check that the backend is running.");
      }

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    const timer = window.setTimeout(getDashboardStats, 0);
    return () => window.clearTimeout(timer);
  }, []);


  // ================= LOADING =================

  if (loading) {

    return (

      <AdminLayout>

        <div className="dashboard-content">

          <h2>
            Loading dashboard...
          </h2>

        </div>

      </AdminLayout>

    );

  }

  if (loadError) {
    return (
      <AdminLayout>
        <div className="dashboard-content">
          <section className="admin-access-error" role="alert">
            <h2>Admin dashboard unavailable</h2>
            <p>{loadError}</p>
          </section>
        </div>
      </AdminLayout>
    );
  }


  // ================= METRICS =================

    const metrics = [
  {
    title: "Total Users",
    value: dashboard.total_users,
    icon: Users,
    type: "green",
  },
  {
    title: "Total Drivers",
    value: dashboard.total_drivers,
    icon: Car,
    type: "green",
  },
  {
    title: "Active Rides",
    value: dashboard.active_rides,
    icon: Activity,
    type: "yellow",
  },
  {
    title: "Revenue",
    value: `₹${dashboard.total_revenue}`,
    icon: Wallet,
    type: "green",
  },
  {
    title: "Completed",
    value: dashboard.completed_rides,
    icon: CheckCircle,
    type: "green",
  },
  {
    title: "Cancelled",
    value: dashboard.cancel_rides,
    icon: XCircle,
    type: "red",
  },
  {
    title: "Total Available Charging Port",
    value: dashboard.total_available_charging_ports,
    icon: Zap,
    type: "green",
  },
  {
    title: "Total Rides",
    value: dashboard.total_rides,
    icon: Motorbike,
    type: "green",
  },
];



  // ================= UI =================

  return (

    <AdminLayout>


      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            VoltRide Admin
          </h1>

          <p>
            Platform overview
          </p>

        </div>


        <div className="live-status">

          <span></span>

          LIVE

        </div>

      </header>



      {/* =========================
          DASHBOARD CONTENT
      ========================= */}

      <div className="dashboard-content">



        {/* =========================
            GREEN IMPACT
        ========================= */}

        <section className="impact-card">

          <div className="impact-icon">

            <Leaf size={28} />

          </div>


          <div>

            <h2>
              0.0 kg CO₂ saved
            </h2>

            <p>
              Green impact by our EV fleet
            </p>

          </div>

        </section>



        {/* =========================
            KEY METRICS
        ========================= */}

        <section className="metrics-section">

          <h2 className="section-heading">
            Key Metrics
          </h2>


          <div className="metrics-grid">

            {metrics.map((metric) => {

              const Icon = metric.icon;


              return (

                <div
                  className="metric-card"
                  key={metric.title}
                >


                  {/* ICON */}

                  <div
                    className={`metric-icon ${metric.type}`}
                  >

                    <Icon
                      size={17}
                      strokeWidth={2.5}
                    />

                  </div>



                  {/* VALUE */}

                  <h3>
                    {metric.value}
                  </h3>



                  {/* TITLE */}

                  <p>
                    {metric.title}
                  </p>


                </div>

              );

            })}

          </div>

        </section>



        {/* =========================
            RIDES
        ========================= */}

        <section className="rides-section">

          <h2 className="section-heading">
            Rides — Last 7 Days
          </h2>


          <div className="chart-container">

            {lastSevenDays.length > 0 ? (
              <div className="rides-chart" aria-label="Ride bookings for the last seven days">
                {lastSevenDays.map((day) => {
                  const maxRides = Math.max(...lastSevenDays.map((item) => item.rides), 1);
                  const barHeight = day.rides === 0 ? 6 : Math.max((day.rides / maxRides) * 100, 14);

                  return (
                    <div className="chart-day" key={day.day}>
                      <span className="chart-value">{day.rides}</span>
                      <div className="chart-bar-track">
                        <div className="chart-bar" style={{ height: `${barHeight}%` }} />
                      </div>
                      <span className="chart-label">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="chart-placeholder">
                <div className="chart-message">No ride data available</div>
              </div>
            )}

          </div>

        </section>


      </div>


    </AdminLayout>

  );

};


export default Dashboard;