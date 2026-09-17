// import React, { useState } from "react";

// import AdminLayout from "../../layouts/AdminLayout";
// import DriverCard from "../../components/DriverCard/DriverCard";

// import "./DriverManagement.css";


// const DriverManagement = () => {

//   const [drivers, setDrivers] = useState([
//     {
//       id: 1,
//       name: "Amit Sharma",
//       email: "amit@voltride.com",
//       vehicle: "MG ZS EV",
//       registrationNumber: "KA02EV5678",
//       rating: "4.4",
//       rides: 396,
//       online: true,
//       status: "pending",
//     },

//     {
//       id: 2,
//       name: "Priya Singh",
//       email: "priya@voltride.com",
//       vehicle: "Hyundai Kona",
//       registrationNumber: "KA03EV9012",
//       rating: "4.5",
//       rides: 446,
//       online: true,
//       status: "pending",
//     },

//     {
//       id: 3,
//       name: "Rahul Verma",
//       email: "rahul@voltride.com",
//       vehicle: "Tata Nexon EV",
//       registrationNumber: "MP04EV3456",
//       rating: "4.7",
//       rides: 512,
//       online: true,
//       status: "approved",
//     },
//   ]);


//   const [activeFilter, setActiveFilter] = useState("all");


//   const handleApprove = (driverId) => {

//     setDrivers((previousDrivers) =>

//       previousDrivers.map((driver) =>

//         driver.id === driverId
//           ? {
//               ...driver,
//               status: "approved",
//             }
//           : driver

//       )

//     );

//   };


//   const filteredDrivers = drivers.filter((driver) => {

//     if (activeFilter === "all") {
//       return true;
//     }

//     return driver.status === activeFilter;

//   });


//   return (

//     <AdminLayout>

//       <div className="driver-management-page">

//         {/* HEADER */}

//         <header className="drivers-header">

//           <h1>
//             Drivers
//           </h1>

//           <p>
//             {drivers.length} total
//           </p>

//         </header>


//         {/* FILTER */}

//         <div className="driver-filters">

//           <button
//             className={
//               activeFilter === "all"
//                 ? "driver-filter active"
//                 : "driver-filter"
//             }
//             onClick={() => setActiveFilter("all")}
//           >
//             ALL
//           </button>


//           <button
//             className={
//               activeFilter === "pending"
//                 ? "driver-filter active"
//                 : "driver-filter"
//             }
//             onClick={() => setActiveFilter("pending")}
//           >
//             PENDING
//           </button>


//           <button
//             className={
//               activeFilter === "approved"
//                 ? "driver-filter active"
//                 : "driver-filter"
//             }
//             onClick={() => setActiveFilter("approved")}
//           >
//             APPROVED
//           </button>

//         </div>


//         {/* DRIVER CARDS */}

//         <section className="drivers-list">

//           {filteredDrivers.length > 0 ? (

//             filteredDrivers.map((driver) => (

//               <DriverCard
//                 key={driver.id}
//                 driver={driver}
//                 onApprove={handleApprove}
//               />

//             ))

//           ) : (

//             <div className="no-drivers">

//               <h3>
//                 No drivers found
//               </h3>

//               <p>
//                 There are no drivers in this category.
//               </p>

//             </div>

//           )}

//         </section>

//       </div>

//     </AdminLayout>

//   );

// };


// export default DriverManagement;
import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DriverCard from "../../components/DriverCard/DriverCard";
import { getAllDrivers, updateDriverStatus } from "../../services/driverService";
import "./DriverManagement.css";

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  /* =================================
      1. DATABASE SE DATA FETCH KAREIN
  ================================= */
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getAllDrivers();
      console.log("Backend Response:", response.data);

      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data && Array.isArray(response.data.drivers)) {
        list = response.data.drivers;
      } else if (response.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      }

      setDrivers(list);
    } catch (error) {
      console.error("Drivers fetch karne me error aayi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  /* =================================
      2. APPROVE DRIVER (DB UPDATE)
  ================================= */
  const handleApprove = async (driverId) => {
    try {
      await updateDriverStatus(driverId, "approved");

      // Robust State update (d.id ya user_id fallback ke sath)
      setDrivers((previousDrivers) =>
        previousDrivers.map((driver) => {
          const currentId = driver.driver_id || driver.id || driver.user_id;
          return currentId === driverId ? { ...driver, status: "approved" } : driver;
        })
      );
    } catch (error) {
      console.error("Driver approve karne me error:", error);
      alert("Driver status update failed!");
    }
  };

  /* =================================
      3. FILTER DRIVERS LOGIC
  ================================= */
  const filteredDrivers = drivers.filter((driver) => {
    const status = (driver.status || "approved").toLowerCase();

    if (activeFilter === "all") {
      return true;
    }
    return status === activeFilter.toLowerCase();
  });

  return (
    <AdminLayout>
      <div className="driver-management-page">
        {/* HEADER */}
        <header className="drivers-header">
          <div>
            <h1>Drivers</h1>
            <p>{drivers.length} total</p>
          </div>
        </header>

        {/* FILTER BUTTONS */}
        <div className="driver-filters">
          <button
            className={activeFilter === "all" ? "driver-filter active" : "driver-filter"}
            onClick={() => setActiveFilter("all")}
          >
            ALL
          </button>

          <button
            className={activeFilter === "pending" ? "driver-filter active" : "driver-filter"}
            onClick={() => setActiveFilter("pending")}
          >
            PENDING
          </button>

          <button
            className={activeFilter === "approved" ? "driver-filter active" : "driver-filter"}
            onClick={() => setActiveFilter("approved")}
          >
            APPROVED
          </button>
        </div>

        {/* DRIVER CARDS */}
        <section className="drivers-list">
          {loading ? (
            <p style={{ textAlign: "center", width: "100%", padding: "20px" }}>
              Loading drivers...
            </p>
          ) : filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver, index) => {
              // Priority Unique Key assign
              const uniqueKey = driver.driver_id || driver.id || driver.user_id || index;
              const targetDriverId = driver.driver_id || driver.id || driver.user_id;

              return (
                <DriverCard
                  key={uniqueKey}
                  driver={{
                    ...driver,
                    id: targetDriverId,
                    name: driver.name || "Driver",
                    email: driver.email || "",
                    vehicle: driver.vehicle_model || driver.vehicle || driver.model || "EV Vehicle",
                    registrationNumber:
                      driver.vehicle_number || driver.registrationNumber || driver.license_no || "N/A",
                    rating: driver.rating || "4.5",
                    rides: driver.rides || 0,
                    status: driver.status || "APPROVED"
                  }}
                  onApprove={() => handleApprove(targetDriverId)}
                />
              );
            })
          ) : (
            <div className="no-drivers">
              <h3>No drivers found</h3>
              <p>There are no drivers in this category.</p>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default DriverManagement;