import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const MAX_REFRESH_ATTEMPTS = 3;
let refreshAttempts = 0;

const forceLogout = () => {
  if (globalThis.window === undefined) return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  globalThis.location.href = "/login";
};

const isAuthRoute = (url = "") => {
  return [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/refresh",
    "/api/v1/auth/logout",
  ].some((route) => url.includes(route));
};

api.interceptors.request.use((config) => {
  const requestUrl = config?.url || "";
  if (globalThis.window === undefined) return config;
  if (isAuthRoute(requestUrl)) return config;

  const token = localStorage.getItem("token");
  if (!token) return config;

  config.headers = config.headers || {};
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || "";

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !isAuthRoute(requestUrl)
    ) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        forceLogout();
        throw error;
      }

      originalRequest._retry = true;
      refreshAttempts += 1;

      try {
        await axios.post(
          "http://localhost:3000/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );
        refreshAttempts = 0;
        return api(originalRequest);
      } catch {
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          forceLogout();
        }
      }
    }

    throw error;
  }
);

export default api;
