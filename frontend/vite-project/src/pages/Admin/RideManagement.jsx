import React from "react";

import AdminLayout from "../../layouts/AdminLayout";

import "./RideManagement.css";

const RideManagement = () => {
  return (
    <AdminLayout>

      <div className="ride-management-page">

        {/* Header */}
        <header className="rides-header">

          <h1>
            All Rides
          </h1>

          <p>
            0 total bookings
          </p>

        </header>


        {/* Empty State */}
        <main className="rides-empty-state">

          <p>
            No rides yet
          </p>

        </main>

      </div>

    </AdminLayout>
  );
};

export default RideManagement;