"use client";

import { useState } from "react";
import Image from "next/image";
import ChevronDown from "@/public/icons/chevron-down.svg";

type AccordionItem = {
  question: string;
  answer: string;
};

export default function Accordion({
  items,
}: Readonly<{ items: AccordionItem[] }>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      {items.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <div key={index} className="border-b border-[#2477DC] py-4">
            {/* Question */}
            <button
              onClick={() => toggle(index)}
              className="flex justify-between items-center w-full text-left gap-4"
            >
              <span
                className={`transition-all ${
                  isOpen
                    ? "font-semibold text-black"
                    : "font-medium text-[#181818]"
                }`}
              >
                {item.question}
              </span>

              <Image
                src={ChevronDown}
                alt="toggle"
                width={18}
                height={18}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Answer */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-[#181818] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}