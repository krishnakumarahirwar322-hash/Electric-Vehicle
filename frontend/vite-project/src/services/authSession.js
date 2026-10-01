export const getAuthToken = () => (
  sessionStorage.getItem("token") || localStorage.getItem("token")
);

export const saveAuthToken = (token) => {
  sessionStorage.setItem("token", token);
  localStorage.setItem("token", token);
};

export const clearAuthSession = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const clearAuthToken = (token) => {
  if (!token) return;
  if (sessionStorage.getItem("token") === token) sessionStorage.removeItem("token");
  if (localStorage.getItem("token") === token) localStorage.removeItem("token");
};