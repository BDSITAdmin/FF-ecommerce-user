"use client";

import Image from "next/image";
import { Search, ShoppingCart, User } from "lucide-react";
import { useSelector } from "react-redux";
import Logo from "../public/assate/Layer_1.png";

export default function Header() {
  const user = useSelector((state: { user: { user: any } }) => state.user.user);
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.email ||
    "Guest";

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
          <a href="/shop" className="transition-colors hover:text-green-700 text-white">
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
          <button className="relative rounded-full p-2.5 hover:bg-green-100">
            <ShoppingCart className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              3
            </span>
          </button>

          <button className="rounded-full p-2.5 hover:bg-green-100 flex items-center gap-2">
            <User className="h-6 w-6 text-white" />
            <span className="hidden lg:inline text-sm font-medium text-white max-w-32 truncate">
              {userName}
            </span>
          </button>


        </div>
      </div>

      <div className="border-t border-green-200 md:hidden">
        <div className="container mx-auto flex items-center justify-around py-3 text-base font-semibold">
          <a href="/shop" className="flex flex-col items-center text-green-800 hover:text-green-600">
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
    </header>
  );
}
