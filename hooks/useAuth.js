"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/userSlice";
import { getCurrentUser, loginUser, logoutUser } from "../services/auth.service";


export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const hasFirstName = (value) => {
    if (!value || typeof value !== "object") return false;

    // Normalize nested shapes like `{ user: { firstName: "..." } }`.
    const normalized =
      value.user && typeof value.user === "object" ? value.user : value;

    return Boolean(
      normalized.firstName ||
      normalized.first_name ||
      normalized.firstname ||
      normalized.givenName
    );
  };

  const login = async (data) => {
    setIsLoading(true);
    try {
      const res = await loginUser(data);

      // Persist token if the API returns one (the axios instance will attach it automatically).
      try {
        const token =
          res?.data?.token ??
          res?.data?.data?.token ??
          res?.data?.accessToken ??
          res?.data?.data?.accessToken ??
          res?.data?.jwt ??
          res?.data?.data?.jwt ??
          null;
        if (typeof token === "string" && token) {
          localStorage.setItem("token", token);
        }
      } catch { }

      let currentUser =
        res?.data?.user ??
        res?.data?.data?.user ??
        res?.data?.data ??
        null;
      if (!currentUser || !hasFirstName(currentUser)) {
        const delays = [0, 250, 750];
        for (const delayMs of delays) {
          try {
            if (delayMs) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            const meRes = await getCurrentUser();
            const meUser =
              meRes?.data?.user ??
              meRes?.data?.data?.user ??
              meRes?.data?.data ??
              null;
            if (meUser) currentUser = meUser;
            if (currentUser && hasFirstName(currentUser)) break;
          } catch { }
        }
      }

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
    try {
      await logoutUser(); // backend logout (cookie clear)
    } catch (err) {
      console.warn("Logout API failed, forcing logout...");
    }

    // ✅ Always clear frontend state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    dispatch(clearUser());

    // ✅ Redirect
    window.location.replace("/login");
  };

  return { login, logoutAction, isLoading };
};
