import axios from "axios";


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});
/* ======================================================
  REFRESH CONTROL
====================================================== */
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/* ======================================================
    FORCE LOGOUT (FIXED - NO LOOP)
====================================================== */
const forceLogout = async () => {
  if (globalThis.window === undefined) return;

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/logout`,
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/logout`,
      {},
      { withCredentials: true }
    );
  } catch (e) {
    // ignore errors
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();

  //  Prevent infinite loop
  if (globalThis.window.location.pathname !== "/login") {
    globalThis.window.location.replace("/login");
  }
};

/* ======================================================
    AUTH ROUTES CHECK
====================================================== */
const isAuthRoute = (url = "") => {
  return [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/refresh",
    "/api/v1/auth/logout",
  ].some((route) => url?.includes(route));
};

/* ======================================================
    REQUEST INTERCEPTOR
====================================================== */
api.interceptors.request.use(
  (config) => {
    if (globalThis.window === undefined) return config;

    const token = localStorage.getItem("token");

    if (token && !isAuthRoute(config.url)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
    RESPONSE INTERCEPTOR (FIXED)
====================================================== */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    //  Stop everything if already on login page
    if (globalThis.window?.location?.pathname === "/login") {
      return Promise.reject(error);
    }

    //  Handle 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url)
    ) {
      //  If already refreshing → queue requests
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken || res.data?.accessToken;

        if (!newToken) throw new Error("No access token returned");

        //  Save token
        localStorage.setItem("token", newToken);

        //  Notify queued requests
        onRefreshed(newToken);
        isRefreshing = false;

        //  Retry original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        await forceLogout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
