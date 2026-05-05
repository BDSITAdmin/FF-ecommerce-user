"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
 
  ChevronDown,
  UserCircle2,
  LogOut,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import Logo from "../public/assate/home-logo.svg";
import Cart from "../public/icons/cart.svg";

type RootState = {
  user: { user: unknown };
  cart: { items: unknown[] };
};

type CartAddedDetail = {
  name?: string;
  image?: string;
  packLabel?: string;
  quantity?: number;
  units?: number;
  price?: number;
  lineTotal?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const firstNonEmptyString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return "";
};

const getUserDisplayName = (user: unknown) => {
  if (!isRecord(user)) return "Guest";

  // Some backends store the user under `user.user`.
  const normalized = isRecord(user.user) ? user.user : user;

  const firstName = firstNonEmptyString(
    normalized.firstName,
    normalized.first_name,
    normalized.firstname,
    normalized.givenName
  );

  // Show only first name when logged in; never show email.
  return firstName || "User";
};

export default function Header() {
  const router = useRouter();
  const { logoutAction } = useAuth();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const cartToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = useSelector((state: RootState) => state.user.user);
  const cartItems = useSelector((state: RootState) => state.cart.items) || [];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [cartTooltipData, setCartTooltipData] = useState<CartAddedDetail | null>(null);

  const userName = getUserDisplayName(user);

  const isLoggedIn = !!user;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleCartItemAdded = (event: Event) => {
      const customEvent = event as CustomEvent<CartAddedDetail>;
      setCartTooltipData(customEvent.detail || {});
      setShowCartTooltip(true);

      if (cartToastTimerRef.current) clearTimeout(cartToastTimerRef.current);
      cartToastTimerRef.current = setTimeout(() => {
        setShowCartTooltip(false);
      }, 2600);
    };

    globalThis.window?.addEventListener("cart:item-added", handleCartItemAdded);

    return () => {
      globalThis.window?.removeEventListener("cart:item-added", handleCartItemAdded);
      if (cartToastTimerRef.current) {
        clearTimeout(cartToastTimerRef.current);
      }
    };
  }, []);

  const formatAmount = (value: unknown) => Math.round(Number(value || 0)).toLocaleString("en-IN");

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
    <header className="sticky top-0 z-50 w-full border-b  bg-[#181818]  shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between ">

        {/* Logo */}
        <div className="flex items-center gap-2 pl-3  sm:px-0">
          <Image
            src={Logo}
            alt="E-commStore"
            width={168}
            height={42}
            className="h-8 w-auto sm:h-9 md:h-10 object-contain"
            priority
          />
        </div>

        {/* Desktop Navigation */}
        {/* <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          <Link href="/products" className="text-white hover:text-green-700">
            SHOP
          </Link>
          <Link href="/deals" className="text-white hover:text-green-700">
            DEALS
          </Link>
          <Link href="/categories" className="text-white hover:text-green-700">
            CATEGORIES
          </Link>
          <Link href="/about" className="text-white hover:text-green-700">
            ABOUT
          </Link>
        </nav> */}

        {/* Right Section */}
        <div className="flex items-center gap-5">

          {/* Search */}
          {/* <div className="hidden md:flex items-center rounded-full border-2 border-green-300 bg-white px-4 py-2.5 text-base focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-200">
            <Search className="mr-2 h-5 w-5 text-green-600" />

            <input
              type="search"
              placeholder="Search products..."
              className="w-72 bg-transparent outline-none placeholder:text-green-400 text-green-800"
            />
          </div> */}

          {/* Mobile Search */}
          {/* <button className="md:hidden rounded-full p-2.5 hover:bg-green-100">
            <Search className="h-6 w-6 text-green-700" />
          </button> */}

          {/* Cart */}
          <div className="relative">
            <Link href="/cart" className="relative rounded-full p-2.5 block">
              <Image src={Cart} alt="Cart" width={36} height={36} className="" />

              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {showCartTooltip && cartTooltipData && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-80 w-80 rounded-xl border border-[#D1FAE5] bg-white p-4 shadow-2xl">
                <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t border-[#D1FAE5] bg-white" />
                <p className="text-sm font-semibold text-[#047857]">Added to cart</p>

                <div className="mt-3 flex items-start gap-3">
                  <img
                    src={cartTooltipData.image || "/assate/home-image.webp"}
                    alt={cartTooltipData.name || "Product"}
                    className="h-14 w-14 rounded-md border border-gray-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{cartTooltipData.name || "Item"}</p>
                    <p className="mt-1 text-xs text-gray-600">{cartTooltipData.packLabel || "Pack"}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Qty: {cartTooltipData.quantity || 1} pack(s) • {cartTooltipData.units || 1} units
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0065A6]">Rs. {formatAmount(cartTooltipData.lineTotal || cartTooltipData.price)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCartTooltip(false);
                    router.push("/cart");
                  }}
                  className="mt-3 w-full rounded-lg bg-[#0065A6] px-3 py-2 text-sm font-medium text-white"
                >
                  Go to Cart
                </button>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-full px-3 py-2 cursor-pointer flex items-center gap-2"
            >
              <span className=" text-sm sm:text-xl font-medium text-white max-w-32 truncate">
                {userName}
              </span>
              <ChevronDown className="h-6 w-6 sm:h-4 sm:w-4 text-white" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">

                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Dashboard
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

      {/* Mobile Bottom Navigation */}
      {/* <div className="border-t border-green-200 md:hidden">
        <div className="container mx-auto flex items-center justify-around py-3 text-base font-semibold">

          <Link href="/products" className="text-green-800 hover:text-green-600">
            SHOP
          </Link>

          <Link href="/deals" className="text-green-800 hover:text-green-600">
            DEALS
          </Link>

          <Link href="/categories" className="text-green-800 hover:text-green-600">
            CATEGORIES
          </Link>

          <Link href="/about" className="text-green-800 hover:text-green-600">
            ABOUT
          </Link>

        </div>
      </div> */}

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-70 bg-black/40 flex items-center justify-center p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <h3 className="text-lg font-semibold text-gray-900">
              Do you want to logout?
            </h3>

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
