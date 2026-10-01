// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://localhost:5000",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// export default api;



import axios from "axios";
import { clearAuthToken, getAuthToken } from "./authSession";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// 1. Request Interceptor: Existing Token Attach Karne Ke Liye
api.interceptors.request.use(
  (config) => {
    const skipAuth = config.skipAuth;
    delete config.skipAuth;
    const token = getAuthToken();
    const hasExplicitAuthorization = config.headers?.Authorization || config.headers?.authorization;
    if (!skipAuth && token && !hasExplicitAuthorization) {
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
      const authorization = error.config?.headers?.Authorization || error.config?.headers?.authorization || "";
      const failedToken = authorization.replace(/^Bearer\s+/i, "");
      if (failedToken) {
        clearAuthToken(failedToken);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;