"use client";

import "./globals.css";
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
      .then((res) => {
        const currentUser =
          res?.data?.user ??
          res?.data?.data?.user ??
          res?.data?.data ??
          null;
        if (currentUser) dispatch(setUser(currentUser));
      })
      .catch(() => {});
  }, [dispatch]);

  return children;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthInitializer>{children}</AuthInitializer>
        </Provider>
      </body>
    </html>
  );
}
