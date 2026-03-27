import React from "react";
import Image from "next/image";
import footerLogo from "../public/assate/footer-logo.svg";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#181818] text-white py-8 px-6 w-full">
            <div className="mx-auto md:max-w-7xl xl:max-w-[1342px]">
                <div className="flex flex-col-reverse gap-6 lg:flex-row lg:justify-between lg:items-start">
                    <div className="w-full mt-4 lg:w-1/3">
                        <Image
                            src={footerLogo}
                            alt="FF Bioworks"
                            width={168}
                            height={42}
                            className="mb-4"
                            priority
                        />

                        <p className="font-[Figtree] font-normal text-[14px] lg:text-[16px] leading-[24px] tracking-[-0.01em]">
                            FF Bioworks (India) Pvt. Ltd. <br />
                            23, 17th Main, HAL 2nd Stage, Bengaluru, <br />
                            Karnataka, India
                        </p>
                        <p className="mt-3 font-[Figtree] font-normal text-[14px] lg:text-[16px] leading-[24px] tracking-[-0.01em]">
                            Email:{" "}
                            <a
                                href="mailto:info@ffbioworks.com"
                                className="hover:underline"
                            >
                                info@ffbioworks.com
                            </a>
                        </p>
                        <p className="mt-1 font-[Figtree] font-normal text-[14px] lg:text-[16px] leading-[24px] tracking-[-0.01em]">
                            Contact Number: +91-80-41494049
                        </p>
                        <div className="flex gap-3 mt-4">
                            <a
                                href="#"
                                className="w-11 h-11 flex items-center justify-center rounded-full border-1 border-white text-white hover:border-white hover:bg-white hover:text-[#003B1B] transition-colors"
                            >
                                <FaLinkedinIn className="text-xl " />
                            </a>
                            <a
                                href="#"
                                className="w-11 h-11 flex items-center justify-center rounded-full border-1 text-white border-white hover:bg-white hover:text-[#003B1B] transition-colors"
                            >
                                <FaInstagram className="text-xl " />
                            </a>
                        </div>

                    </div>
                    <div className="w-full lg:w-2/2 text-sm flex flex-col justify-end gap-4 lg:mt-[72px] md:pt-30 lg:-28">
                        <div className="flex flex-wrap items-center gap-4 pb-3 font-[Figtree] font-normal not-italic lg:text-[16px] leading-[20px] tracking-[0.02em] text-white ">
                            <span className="whitespace-nowrap text-[18px] text-white block sm:hidden">
                                Business Verticals
                            </span>

                            <span className="whitespace-nowrap hover:text-white">Seed Production, Testing & Trait Optimization</span>
                            <div className="hidden h-4 border-r border-white sm:block"></div>
                            <span className="whitespace-nowrap hover:text-white">Contract Farming</span>
                            <div className="hidden h-4 border-r border-white sm:block"></div>
                            <span className="whitespace-nowrap hover:text-white">Innovative Formulations</span>
                            <div className="hidden h-4 border-r border-white sm:block"></div>
                            <span className="whitespace-nowrap hover:text-white">Contract Research</span>
                        </div>
                        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-6 font-[Figtree] font-normal not-italic text-[18px] lg:text-[20px] leading-[20px] tracking-[0.02em] text-white">
                            <span className="whitespace-nowrap hover:text-white">About Us</span>
                            <div className="hidden h-4 border-r border-white sm:block"></div>
                            <span className="whitespace-nowrap hover:text-white">Product Portfolio</span>
                            <div className="hidden h-4 border-r border-white sm:block"></div>
                            <span className="whitespace-nowrap hover:text-white">Innovation & Impact</span>
                            <div className="hidden h-4 border-r border-white sm:block"></div>
                            <span className="whitespace-nowrap hover:text-white">Resources</span>
                        </div>

                        <div className="mt-8 border-t border-white pt-4 md:hidden  text-center text-sm text-white"></div>
                    </div>
                </div>
                <div className="mt-6 border-t border-white pt-4 text-center text-sm text-white">
                    {/* Â© {new Date().getFullYear()} FF Bioworks India Pvt Ltd. All rights reserved. */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;

