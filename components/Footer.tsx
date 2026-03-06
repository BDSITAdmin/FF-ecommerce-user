import Link from "next/link";
import React from "react";

const Footer: React.FC = () => {
    return (
        <>
            <section className="bg-green-900 text-white py-16 text-center">
                <h2 className="text-3xl font-bold">
                    Ready to Transform Your Wellness Journey?
                </h2>

                <p className="mt-4 text-white/80">
                    Discover nature-powered solutions backed by science.
                </p>

                <Link
                    href="/products"
                    className="mt-6 inline-block bg-yellow-400 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition"
                >
                    Explore Collection
                </Link>
            </section>

            <footer className="bg-black text-white text-center py-6">
                © 2026 Himalayan Organics. All rights reserved.
            </footer>
        </>
    );
};

export default Footer;