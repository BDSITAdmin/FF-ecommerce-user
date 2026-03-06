"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  UserCircle2,
  LogOut,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import Logo from "../public/assate/Layer_1.png";

type RootState = {
  user: { user: any };
  cart: { items: unknown[] };
};

export default function Header() {
  const router = useRouter();
  const { logoutAction } = useAuth();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const user = useSelector((state: RootState) => state.user.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userName =
    user?.firstName?.trim() ||
    (user?.name ? String(user.name).split(" ")[0] : "") ||
    "Guest";
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      if (isLoggedIn) {
        await logoutAction();
      }
    } finally {
      setShowLogoutConfirm(false);
      setIsMenuOpen(false);
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-200 bg-[#181818] text-green-800 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="E-commStore"
            width={160}
            height={56}
            className="h-14 w-auto object-contain"
            priority
          />
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          <a href="/products" className="transition-colors hover:text-green-700 text-white">
            SHOP
          </a>
          <a href="/deals" className="transition-colors hover:text-green-700 text-white">
            DEALS
          </a>
          <a href="/categories" className="transition-colors hover:text-green-700 text-white">
            CATEGORIES
          </a>
          <a href="/about" className="transition-colors hover:text-green-700 text-white">
            ABOUT
          </a>
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center rounded-full border-2 border-green-300 bg-white px-4 py-2.5 text-base focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-200">
            <Search className="mr-2 h-5 w-5 text-green-600" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-72 bg-transparent outline-none placeholder:text-green-400 text-green-800"
            />
          </div>

          <button className="md:hidden rounded-full p-2.5 hover:bg-green-100">
            <Search className="h-6 w-6 text-green-700" />
          </button>

          <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-green-100">
            <ShoppingCart className="h-6 w-6 text-white" />
            {cartItems.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-full px-3 py-2 hover:bg-green-100 flex items-center gap-2"
            >
              <span className="text-sm font-medium text-white max-w-32 truncate">{userName}</span>
              <ChevronDown className="h-4 w-4 text-white" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Update Profile
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-green-200 md:hidden">
        <div className="container mx-auto flex items-center justify-around py-3 text-base font-semibold">
          <a href="/products" className="flex flex-col items-center text-green-800 hover:text-green-600">
            <span>SHOP</span>
          </a>
          <a href="/deals" className="flex flex-col items-center text-green-800 hover:text-green-600">
            <span>DEALS</span>
          </a>
          <a href="/categories" className="flex flex-col items-center text-green-800 hover:text-green-600">
            <span>CATEGORIES</span>
          </a>
          <a href="/about" className="flex flex-col items-center text-green-800 hover:text-green-600">
            <span>ABOUT</span>
          </a>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Do you want to logout?</h3>
            <p className="mt-2 text-sm text-gray-600">
              You will need to login again to access your account.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
