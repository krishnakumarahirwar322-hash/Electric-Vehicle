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

// 1. New Driver Register Karne Ke Liye (Pending Status Direct Banega)
export const registerDriver = (driverData) => {
    return api.post("/api/drivers/register", driverData);
};

// 2. Sabhi Drivers Fetch Karne Ke Liye (Pending + Approved)
export const getAllDrivers = () => {
    return api.get("/api/drivers");
};

// 3. Admin Se Driver Approve / Reject Karne Ke Liye
export const updateDriverStatus = (driverId, status) => {
    // Agar aapka status update route router.put("/status") hai:
    return api.put("/api/drivers/status", { 
        driver_id: driverId, 
        status: status 
    });

    // YA agar aapne router.put("/:id/status") ya router.patch("/:id") banaya hai:
    // return api.put(`/api/drivers/${driverId}/status`, { status });
};