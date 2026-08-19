// import React, { useState } from "react";

// import DriverCard from "../../components/DriverCard/DriverCard";

// import "./DriverManagement.css";


// const DriverManagement = () => {

//   /* =================================
//      DRIVER DATA
//   ================================= */

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


//   /* =================================
//      ACTIVE FILTER
//   ================================= */

//   const [activeFilter, setActiveFilter] = useState("all");


//   /* =================================
//      APPROVE DRIVER
//   ================================= */

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


//   /* =================================
//      FILTER DRIVERS
//   ================================= */

//   const filteredDrivers = drivers.filter((driver) => {

//     if (activeFilter === "all") {
//       return true;
//     }

//     return driver.status === activeFilter;

//   });


//   return (

//     <div className="driver-management-page">


//       {/* =================================
//           HEADER
//       ================================= */}

//       <header className="drivers-header">

//         <div>

//           <h1>
//             Drivers
//           </h1>

//           <p>
//             {drivers.length} total
//           </p>

//         </div>

//       </header>


//       {/* =================================
//           FILTER BUTTONS
//       ================================= */}

//       <div className="driver-filters">

//         <button
//           className={
//             activeFilter === "all"
//               ? "driver-filter active"
//               : "driver-filter"
//           }
//           onClick={() => setActiveFilter("all")}
//         >
//           ALL
//         </button>


//         <button
//           className={
//             activeFilter === "pending"
//               ? "driver-filter active"
//               : "driver-filter"
//           }
//           onClick={() => setActiveFilter("pending")}
//         >
//           PENDING
//         </button>


//         <button
//           className={
//             activeFilter === "approved"
//               ? "driver-filter active"
//               : "driver-filter"
//           }
//           onClick={() => setActiveFilter("approved")}
//         >
//           APPROVED
//         </button>

//       </div>


//       {/* =================================
//           DRIVER LIST
//       ================================= */}

//       <section className="drivers-list">

//         {filteredDrivers.length > 0 ? (

//           filteredDrivers.map((driver) => (

//             <DriverCard
//               key={driver.id}
//               driver={driver}
//               onApprove={handleApprove}
//             />

//           ))

//         ) : (

//           <div className="no-drivers">

//             <h3>
//               No drivers found
//             </h3>

//             <p>
//               There are no drivers in this category.
//             </p>

//           </div>

//         )}

//       </section>


//     </div>

//   );
// };

// export default DriverManagement;





import React, { useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import DriverCard from "../../components/DriverCard/DriverCard";

import "./DriverManagement.css";


const DriverManagement = () => {

  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "Amit Sharma",
      email: "amit@voltride.com",
      vehicle: "MG ZS EV",
      registrationNumber: "KA02EV5678",
      rating: "4.4",
      rides: 396,
      online: true,
      status: "pending",
    },

    {
      id: 2,
      name: "Priya Singh",
      email: "priya@voltride.com",
      vehicle: "Hyundai Kona",
      registrationNumber: "KA03EV9012",
      rating: "4.5",
      rides: 446,
      online: true,
      status: "pending",
    },

    {
      id: 3,
      name: "Rahul Verma",
      email: "rahul@voltride.com",
      vehicle: "Tata Nexon EV",
      registrationNumber: "MP04EV3456",
      rating: "4.7",
      rides: 512,
      online: true,
      status: "approved",
    },
  ]);


  const [activeFilter, setActiveFilter] = useState("all");


  const handleApprove = (driverId) => {

    setDrivers((previousDrivers) =>

      previousDrivers.map((driver) =>

        driver.id === driverId
          ? {
              ...driver,
              status: "approved",
            }
          : driver

      )

    );

  };


  const filteredDrivers = drivers.filter((driver) => {

    if (activeFilter === "all") {
      return true;
    }

    return driver.status === activeFilter;

  });


  return (

    <AdminLayout>

      <div className="driver-management-page">

        {/* HEADER */}

        <header className="drivers-header">

          <h1>
            Drivers
          </h1>

          <p>
            {drivers.length} total
          </p>

        </header>


        {/* FILTER */}

        <div className="driver-filters">

          <button
            className={
              activeFilter === "all"
                ? "driver-filter active"
                : "driver-filter"
            }
            onClick={() => setActiveFilter("all")}
          >
            ALL
          </button>


          <button
            className={
              activeFilter === "pending"
                ? "driver-filter active"
                : "driver-filter"
            }
            onClick={() => setActiveFilter("pending")}
          >
            PENDING
          </button>


          <button
            className={
              activeFilter === "approved"
                ? "driver-filter active"
                : "driver-filter"
            }
            onClick={() => setActiveFilter("approved")}
          >
            APPROVED
          </button>

        </div>


        {/* DRIVER CARDS */}

        <section className="drivers-list">

          {filteredDrivers.length > 0 ? (

            filteredDrivers.map((driver) => (

              <DriverCard
                key={driver.id}
                driver={driver}
                onApprove={handleApprove}
              />

            ))

          ) : (

            <div className="no-drivers">

              <h3>
                No drivers found
              </h3>

              <p>
                There are no drivers in this category.
              </p>

            </div>

          )}

        </section>

      </div>

    </AdminLayout>

  );

};


export default DriverManagement;