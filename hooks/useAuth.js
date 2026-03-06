"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout } from "../store/userSlice";
import { loginUser, logoutUser } from "../services/auth.service";

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data) => {
    setIsLoading(true);
    try {
      const res = await loginUser(data);
      const currentUser =
        res?.data?.user ??
        res?.data?.data?.user ??
        res?.data?.data ??
        null;
      if (currentUser) {
        dispatch(setUser(currentUser));
      }
      return res;
    } catch (error) {
      const status = error?.response?.status;
      const retryAfterHeader = error?.response?.headers?.["retry-after"];
      const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10);

      if (status === 429) {
        const waitSeconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds
          : 60;
        throw new Error(`Too many attempts, try again in ${waitSeconds} seconds.`);
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAction = async () => {
    await logoutUser();
    dispatch(logout());
  };

  return { login, logoutAction, isLoading };
};
