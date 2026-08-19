import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";

import  "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">

      <Sidebar />

      <main className="admin-main">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;