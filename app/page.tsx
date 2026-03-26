"use client";

import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import heroImage from "../public/assate/Front@2x 1.png";
import Footer from "../components/Footer";
import HomeProductsSection from "../components/products/HomeProductsSection";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f6f4]">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-linear-to-r from-green-800 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 items-center gap-12">

          <div>
            <p className="text-lg font-semibold tracking-wide uppercase text-green-200">
              Rooted in India's Horticultural Heritage
            </p>

            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight">
              Seed Science to <br />
              Sustainable Solutions.
            </h1>

            <p className="mt-6 text-lg text-white/90 max-w-lg">
              Transforming agriculture through innovation; cultivating health
              from field to formulation.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/contact"
                className="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-green-800 transition"
              >
                Shop Now
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src={heroImage}
              alt="Testosterone Booster"
              width={400}
              height={500}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <HomeProductsSection />

      {/* Product Highlight Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div className="flex justify-center">
            <Image
              src={heroImage}
              alt="Testosterone Booster Supplement"
              width={350}
              height={450}
              className="rounded-xl shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-green-800">
              Himalayan Organics Testosterone Booster
            </h2>

            <p className="mt-4 text-gray-700 leading-relaxed">
              Premium herbal formulation crafted with Tribulus, Fenugreek,
              Ashwagandha & Safed Musli. Designed to support vitality,
              stamina, and overall performance.
            </p>

            <ul className="mt-6 space-y-2 text-gray-600">
              <li>✔ 60 Vegetarian Tablets</li>
              <li>✔ Natural Herbal Formula</li>
              <li>✔ No Artificial Additives</li>
              <li>✔ Made in India</li>
            </ul>

            <div className="mt-8">
              <Link
                href="/products"
                className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-900 transition"
              >
                View Product
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />


    </main>
  );
}
