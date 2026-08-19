import React from "react";

import {
  Users,
  Car,
  Activity,
  Wallet,
  CheckCircle,
  XCircle,
  Leaf,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";

import "./Dashboard.css";


const Dashboard = () => {

  const metrics = [
    {
      title: "Total Users",
      value: "2",
      icon: Users,
      type: "green",
    },
    {
      title: "Total Drivers",
      value: "3",
      icon: Car,
      type: "green",
    },
    {
      title: "Active Rides",
      value: "0",
      icon: Activity,
      type: "yellow",
    },
    {
      title: "Revenue",
      value: "₹0",
      icon: Wallet,
      type: "green",
    },
    {
      title: "Completed",
      value: "0",
      icon: CheckCircle,
      type: "green",
    },
    {
      title: "Cancelled",
      value: "0",
      icon: XCircle,
      type: "red",
    },
  ];


  return (
    <AdminLayout>

      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">

        <div>
          <h1>VoltRide Admin</h1>

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

                  <div
                    className={`metric-icon ${metric.type}`}
                  >

                    <Icon
                      size={17}
                      strokeWidth={2.5}
                    />

                  </div>


                  <h3>
                    {metric.value}
                  </h3>


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

            <div className="chart-placeholder">

              <div className="chart-message">
                No ride data available
              </div>

            </div>

          </div>

        </section>


      </div>

    </AdminLayout>
  );
};

export default Dashboard;