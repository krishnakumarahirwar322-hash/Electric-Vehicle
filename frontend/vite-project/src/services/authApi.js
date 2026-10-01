import api from "./api";

export const signupUser = (userData) => {
    return api.post("/api/auth/signup", userData);
};

export const loginUser = (loginData) => {
    return api.post("/api/auth/login", loginData, { skipAuth: true });
};

export const requestPasswordReset = (email) => {
    return api.post("/api/auth/forgot-password", { email });
};

export const resetPassword = (token, password) => {
    return api.post(`/api/auth/reset-password/${token}`, { password });
};