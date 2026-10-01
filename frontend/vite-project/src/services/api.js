// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://localhost:5000",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// export default api;



import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// 1. Request Interceptor: Existing Token Attach Karne Ke Liye
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Token Expire Hone Par Auto-Handle Karne Ke Liye
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Token expire ho gaya hai. Re-login karein.");
      
      // Expire token ko clean karein
      localStorage.removeItem("token");
      
      // User ko login page par redirect karein
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;