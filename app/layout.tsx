"use client";

import "./globals.css";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import { fetchCart } from "../store/cartSlice";
import { getCurrentUser } from "../services/auth.service";
import Footer from "../components/Footer";

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        const currentUser =
          res?.data?.user ??
          res?.data?.data?.user ??
          res?.data?.data ??
          null;
        if (currentUser) {
          dispatch(setUser(currentUser));
          dispatch(fetchCart() as any);
        }
      })
      .catch(() => {});
  }, [dispatch]);

  return children;
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider store={store}>
          <AuthInitializer>
            {children}
            <Footer />
          </AuthInitializer>
        </Provider>
      </body>
    </html>
  );
}
