"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import { getCurrentUser } from "../services/auth.service";

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    getCurrentUser()
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => {});
  }, [dispatch]);

  return children;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
