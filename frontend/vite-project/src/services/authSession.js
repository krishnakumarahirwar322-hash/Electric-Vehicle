export const getAuthToken = () => (
  sessionStorage.getItem("token") || localStorage.getItem("token")
);

export const saveAuthToken = (token) => {
  sessionStorage.setItem("token", token);
  localStorage.setItem("token", token);
};

export const getAuthUser = () => {
  try {
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const saveAuthUser = (user) => {
  const serializedUser = JSON.stringify(user);
  sessionStorage.setItem("user", serializedUser);
  localStorage.setItem("user", serializedUser);
};

export const clearAuthSession = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const clearAuthToken = (token) => {
  if (!token) return;
  if (sessionStorage.getItem("token") === token) sessionStorage.removeItem("token");
  if (localStorage.getItem("token") === token) localStorage.removeItem("token");
};