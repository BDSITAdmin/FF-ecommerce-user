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
      dispatch(setUser(res?.data?.user));
      return res;
    } catch (error) {
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
