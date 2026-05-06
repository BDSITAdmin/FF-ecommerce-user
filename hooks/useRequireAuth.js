"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setUser } from "../store/userSlice";
import { getCurrentUser } from "../services/auth.service";

export const useRequireAuth = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      if (user) {
        if (active) setChecking(false);
        return;
      }

      if (globalThis.window === undefined) {
        if (active) setChecking(false);
        return;
      }

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser) {
            dispatch(setUser(parsedUser));
            if (active) setChecking(false);
            return;
          }
        }
      } catch { }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const meRes = await getCurrentUser();
          const nextUser =
            meRes?.data?.user ??
            meRes?.data?.data?.user ??
            meRes?.data?.data ??
            null;

          if (nextUser) {
            dispatch(setUser(nextUser));
            try {
              localStorage.setItem("user", JSON.stringify(nextUser));
            } catch { }
          }
        } catch { }
      }

      if (active) setChecking(false);
    };

    hydrateUser();

    return () => {
      active = false;
    };
  }, [user, dispatch]);

  useEffect(() => {
    if (!checking && !user) {
      router.push("/login");
    }
  }, [checking, user, router]);

  return { checking };
};
