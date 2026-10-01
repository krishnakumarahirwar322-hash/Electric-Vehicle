// import api from "./api";

// export const getAllDrivers = () => {
//     return api.get("/api/admin/drivers");
// };

// export const addDriver = (driverData) => {
//     return api.post("/api/admin/drivers", driverData);
// };

// export const deleteDriver = (driverId) => {
//     return api.delete(`/api/admin/drivers/${driverId}`);
// };


import api from "./api";

export const applyForDriver = (applicationData) => {
  return api.post("/api/drivers/apply", applicationData);
};

export const registerDriver = applyForDriver;

// 2. Sabhi Drivers Fetch Karne Ke Liye (Pending + Approved)
export const getAllDrivers = () => {
    return api.get("/api/drivers");
};


export const updateDriverStatus = async (driverId, status) => {
  // Backend relies on req.body: { driver_id, status }
  return await api.put("/api/drivers/status", {
    driver_id: driverId,
    status: status
  });
};

export const approveDriver = ({ driverId }) => updateDriverStatus(driverId, "approved");

    // YA agar aapne router.put("/:id/status") ya router.patch("/:id") banaya hai:
    // return api.put(`/api/drivers/${driverId}/status`, { status });
