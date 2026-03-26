"use client";

import { useState } from "react";
import Image from "next/image";
import ChevronDown from "@/public/icons/chevron-down.svg";

type AccordionItem = {
  question: string;
  answer: string;
};

export default function Accordion({ items }: Readonly<{ items: AccordionItem[] }>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={index} className="border-b border-blue-500 py-4">

          {/* Question */}
          <button
            onClick={() => toggle(index)}
            className="flex justify-between items-center w-full text-left"
          >
            <span
              className={`${activeIndex === index ? "font-bold text-[#000000]" : "font-medium text-[#181818]"
                }`}
            >
              {item.question}
            </span>

            <Image
              src={ChevronDown}
              alt=""
              width={18}
              height={18}
              className={`transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Answer */}
          <div
            className={`overflow-hidden transition-all duration-500 ${activeIndex === index ? "max-h-40 mt-3" : "max-h-0"
              }`}
          >
            <p className="text-[#181818] leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
