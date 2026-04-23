import api from "./api";

export const loginUser = (data) => {
  return api.post("/api/v1/auth/login", data);
};

export const loginWithGoogleUser = (credential) => {
  return api.post("/api/v1/auth/google", { credential });
};

export const logoutUser = () => {
  return api.post("/api/v1/auth/logout");
};

export const getCurrentUser = () => {
  return api.get("/api/v1/auth/me", { skipAuthRefresh: true });
};

export const sendResetOtp = (email) => {
  return api.post("/api/v1/auth/send-reset-otp", { email });
};

export const verifyResetOtp = (email, otp) => {
  return api.post("/api/v1/auth/verify-reset-otp", { email, otp });
};

export const resetPassword = (email, otp, newPassword) => {
  return api.post("/api/v1/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
};

export const changePassword = (data) => {
  return api.patch("/api/v1/auth/change-password", data);
};
