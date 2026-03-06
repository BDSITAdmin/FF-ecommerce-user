import api from "./api";

export const loginUser = (data) => {
  return api.post("/api/v1/auth/login", data);
};

export const logoutUser = () => {
  return api.post("/api/v1/auth/logout");
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};
