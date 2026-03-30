"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { addToCartAsync } from "../store/cartSlice";
import Navbar from "./Navbar";
import Accordion from "./Accordion";
import IxanBottle from "@/assets/ixan-bottle.png";

type Product = {
  id: string | number;
  name: string;
  price: string | number;
  compareAtPrice?: string | number;
  category?: string;
  sku?: string;
  stock?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  images?: string[];
  description?: string;
};

type ProductDetailsProps = {
  productId?: string | number | null;
};

const ingredients = [
  {
    heading: "Curcuminoids (60 mg)",
    description:
      "Curcuminoids are powerful natural compounds known for their ability to neutralize oxidative stress and calm chronic inflammation, two major drivers of retinal and metabolic damage.",
    keyBenefits: [
      "Protect retinal cells",
      "Support microvascular health",
      "Reduce inflammation linked to Diabetic Retinopathy",
    ],
  },
  {
    heading: "Lutein (10 mg)",
    description:
      "Lutein is concentrated in the macula, where it filters harmful visible light from screens and sunlight.",
    keyBenefits: [
      "Improve visual clarity & focus",
      "Enhance macular pigment density",
      "Protect against digital-screen strain",
      "Reduce glare & improve night vision",
    ],
  },
  {
    heading: "Trans-Zeaxanthin (1 mg)",
    description:
      "Zeaxanthin works alongside lutein to support the central retina.",
    keyBenefits: [
      "Defend against oxidative retina damage",
      "Improve contrast sensitivity",
      "Protect visual performance during high screen exposure",
    ],
  },
  {
    heading: "Bilberry Extract (50 mg)",
    description:
      "Bilberry is rich in anthocyanins, known for enhancing blood vessel integrity in the eye.",
    keyBenefits: [
      "Improve retinal microcirculation",
      "Reduce eye fatigue",
      "Strengthen capillaries in Diabetic Retinopathy-prone eyes",
    ],
  },
  {
    heading: "Licorice Extract (25 mg)",
    description:
      "Licorice provides gentle systemic anti-inflammatory support.",
    keyBenefits: [
      "Reduce oxidative burden",
      "Support healthy cellular response",
      "Stabilize metabolic and ocular stress",
    ],
  },
  {
    heading: "Zinc (10 mg, as Zinc Gluconate)",
    description:
      "Zinc plays a key role in transporting Vitamin A from the liver to the retina to produce protective melanin.",
    keyBenefits: [
      "Support sharper vision",
      "Protect retinal pigment epithelium",
      "Strengthen immunity & cell repair mechanisms",
    ],
  },
  {
    heading: "Alpha Lipoic Acid (ALA) (25 mg)",
    description:
      "ALA is one of the few antioxidants that works in both fat and water-based tissues, giving whole-cell protection.",
    keyBenefits: [
      "Improve insulin sensitivity",
      "Support nerve & retinal cell protection",
      "Boost antioxidant recycling (Vitamin C, E, Glutathione)",
    ],
  },
];

const faqs = [
  {
    question: "Can ixan+ be taken along with diabetes medication?",
    answer:
      "Yes. Ixan's antioxidant matrix supports macular pigment density, helping protect against cataracts, age-related macular degeneration (AMD), and retina damage.",
  },
  {
    question: "Is ixan+ helpful for people with long-term computer or mobile usage?",
    answer:
      "Yes, it helps reduce digital eye strain and protects the retina from blue light exposure.",
  },
  {
    question: "Will ixan+ improve my night vision?",
    answer:
      "It supports retinal health and macular pigment which may improve visual clarity and night vision.",
  },
  {
    question: "Can I take ixan+ if I don't have eye problems?",
    answer:
      "Yes, it can be used as a preventive supplement to maintain healthy vision.",
  },
  {
    question: "Is IXAN+ safe for people with high blood pressure or cholesterol?",
    answer:
      "Yes, but it is always recommended to consult your doctor before starting any supplement.",
  },
  {
    question: "How is IXAN+ different from normal Lutein-Zeaxanthin supplements?",
    answer:
      "IXAN+ includes a broader antioxidant matrix including curcuminoids, bilberry extract, and alpha lipoic acid.",
  },
  {
    question: "Is IXAN+ suitable for people working night shifts?",
    answer:
      "Yes, it helps reduce screen strain and supports retinal protection for people exposed to long hours of artificial light.",
  },
];

const testimonials = [
  {
    name: "Rohit S.",
    city: "Bangalore",
    title: "My screen strain reduced within 2 weeks!",
    message:
      "I work 10+ hours on a laptop and always had eye heaviness and dryness. After starting iXAN+, my eyes feel less strained, and the evening headaches have reduced a lot.",
  },
  {
    name: "Sangeeta P.",
    city: "Pune",
    title: "Really helpful for early diabetic eye stress.",
    message:
      "I'm pre-diabetic and had mild retinal changes. My ophthalmologist recommended antioxidants. IXAN+ has made my vision more stable and reduced flickering.",
  },
  {
    name: "Nikhil R.",
    city: "Mumbai",
    title: "Premium formula. Worth the price.",
    message:
      "The patented matrix and clean-label formula made me try it. My focus, eye comfort, and overall energy feel better.",
  },
  {
    name: "Prakash K.",
    city: "Coimbatore",
    title: "Perfect for my mother who has early diabetic retinopathy.",
    message:
      "She feels her vision is steadier, and her doctor said her retinal stress markers look better. Very happy.",
  },
  {
    name: "Arun M.",
    city: "Hyderabad",
    title: "Sharper vision & better night driving.",
    message:
      "I noticed clearer vision and reduced glare while driving at night. The improvement in contrast sensitivity is real.",
  },
  {
    name: "Vani K.",
    city: "Chennai",
    title: "The only supplement that helped my dry, irritated eyes.",
    message:
      "Long screen hours made my eyes burn. IXAN+ brought noticeable relief and freshness. I feel less tired even after a full workday.",
  },
  {
    name: "Pooja D.",
    city: "Gurgaon",
    title: "Great for people with high mobile/laptop use.",
    message:
      "My eyes used to feel heavy by evening. After a month on IXAN+, the discomfort has reduced significantly.",
  },
];

const normalizeProductId = (value: ProductDetailsProps["productId"]) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const user = useSelector((state: { user: { user: unknown } }) => state.user.user);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const resolvedProductId = normalizeProductId(productId);

  useEffect(() => {
    if (!resolvedProductId) return;
    api
      .get(`api/v1/products/${resolvedProductId}`)
      .then((res) => {
        const apiProduct = res?.data?.data?.product ?? null;
        setProduct(apiProduct);
      })
      .catch((err) => console.error(err));
  }, [resolvedProductId]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [...new Set([...(product.images || []), product.image].filter(Boolean))] as string[];
  }, [product]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedIndex(0);
    }
  }, [galleryImages]);

  useEffect(() => {
    const target = thumbnailRefs.current[selectedIndex];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedIndex]);

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      router.push("/login");
      return;
    }
    for (let i = 0; i < quantity; i += 1) {
      dispatch((addToCartAsync as any)({ product, quantity: 1 }));
    }
  };

  if (!resolvedProductId) {
    return <div className="p-10">Loading...</div>;
  }

  if (!product) return <div className="p-10">Loading...</div>;

  return (
    <div className="font-figtree">
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-25">
        <div className="">
          <img
            src={galleryImages[selectedIndex] || "https://via.placeholder.com/400"}
            alt={product.name}
            className="w-177.5 h-124.75"
          />

          {galleryImages.length > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="h-9 w-9 flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <img src="/assate/left arrow.svg" alt="Previous" className="h-4 w-4" />
                </button>

                <div className="flex flex-nowrap justify-center gap-3 max-w-[525px] px-1 overflow-hidden">
                  {galleryImages.length > 0 &&
                    (() => {
                      const windowSize = Math.min(5, galleryImages.length);
                      const start = Math.max(0, selectedIndex - Math.floor(windowSize / 2));
                      const normalizedStart = Math.min(
                        start,
                        Math.max(0, galleryImages.length - windowSize)
                      );
                      const indices = Array.from({ length: windowSize }, (_, i) => normalizedStart + i);
                      return indices.map((index) => {
                        const img = galleryImages[index];
                        return (
                          <button
                            key={`${img}-${index}`}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            ref={(el) => {
                              thumbnailRefs.current[index] = el;
                            }}
                            className={`overflow-hidden rounded border-2 transition ${
                              selectedIndex === index
                                ? "border-green-600"
                                : "border-transparent hover:border-green-300"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="h-[121.85px] w-[95.28px] object-cover"
                            />
                          </button>
                        );
                      });
                    })()}
                </div>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="h-9 w-9 flex items-center justify-center"
                  aria-label="Next image"
                >
                  <img src="/assate/right arrow.svg" alt="Next" className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`h-1.5 w-1.5 rounded-full transition ${
                      selectedIndex === index ? "bg-[#2477DC]" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-10">
          <div className="">
            <h1 className="text-[64px] tracking-wide font-extrabold">{product.name}</h1>
            <h3 className="text-[18px]  font-extrabold mb-4">Powerful | Proven | Patented ixan+</h3>

            <p className="text-gray-600 mb-10">
              {product.description || "No description available"}
            </p>

            <p className=" text-[36px] font-semibold ">Rs. {product.price}/-</p>
            <p className="text-gray-600 mb-26">
              Pack Size: 60 Veg Capsules (2-Month Pack)
            </p>

            <div className="flex items-center gap-4 ">
              <div className="inline-flex w-36.75 h-13 items-center rounded-md border border-[#C5C5C5]">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                  className="h-10 w-10 text-lg font-semibold text-gray-700 hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-12 text-center text-base font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="h-10 w-10 text-lg font-semibold text-gray-700 hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-full bg-[#0065A6] w-78.25 px-9 py-4 font-medium text-white "
              >
                Add to Cart
              </button>
            </div>
          </div>
          <div className="cart section"></div>
        </div>
      </div>

      <div className="bg-white p-10 flex justify-center">
        <div className="bg-[#0e6ea8] pl-14 py-14 pr-10 rounded-2xl  ">
          <div className="max-w-304 space-y-10">
            <div className="bg-[#FFFFFF] rounded-xl px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">
                  What is {product.name}?
                </h2>
                <p className="text-md font-normal text-[#181818] leading-5.5">
                  ixan+ is a patented, clinically validated antioxidant and anti-inflammatory formulation created to safeguard eyes from the constant stress of modern living.
                  <br />
                  <br />
                  Daily exposure to digital screens, pollution, irregular meals, and chronic stress accelerates oxidative damage impacting the eyes first, as they are among the most sensitive organs in the body.
                  <br />
                  ixan+ brings together a powerful blend of Curcuminoids, Lutein, Zeaxanthin, Bilberry, Licorice, Alpha Lipoic Acid, and Zinc to form a synergistic matrix that works at multiple levels:
                  <br />
                  Supports ocular protection and strengthens retinal cells
                  <br />
                  Helps maintain visual performance under digital and environmental strain
                  <br />
                  Promotes metabolic balance, relevant for individuals at risk of or experiencing diabetic eye changes
                  <br />
                  <br />
                  Formulated for modern lifestyles, ixan+ helps protect vision, naturally and effectively.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-[#0065A6] rounded-full w-106.75 h-106.75 flex items-center justify-center">
                  <img
                    src={IxanBottle.src}
                    alt="product image"
                    className="h-100.25 w-91 object-contain mt-25"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl px-16 py-20 grid grid-cols-1  gap-6 items-center">
              <h2 className="font-bold leading-9 tracking-[-1%]   text-[28px] mb-3">
                What Makes {product.name} Different?
              </h2>

              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <img src="/icons/protect-icon.svg" alt="Protect" className="mb-2 h-12 w-12" />
                  <h3 className="font-bold text-[16px] leading-6 mb-1">
                    1. Synergistic Antioxidant & Anti-inflammatory Matrix (Patented)
                  </h3>
                  <p className="text-[#181818] leading-6 text-[16px] ">
                    Curcuminoids + Lutein + Zeaxanthin work together to neutralize oxidative damage and support retinal pigment density.
                  </p>
                </div>

                <div>
                  <img src="/icons/eye-icon.svg" alt="Eye" className="mb-2 h-12 w-12" />
                  <h3 className="font-bold text-[16px] leading-6 mb-1">
                    2. Retina-Targeted Protection
                  </h3>
                  <p className="text-[#181818] leading-6 text-[16px]">
                    Ingredients like Bilberry, ALA, and Zinc provide micro-vascular support essential for retinal health especially in conditions like Diabetic Retinopathy.
                  </p>
                </div>

                <div>
                  <img src="/icons/nuclie-icon.svg" alt="Nuclie" className="mb-2 h-12 w-12" />
                  <h3 className="font-bold text-[16px] leading-6 mb-1">
                    3. Cellular + Organ Wellness
                  </h3>
                  <p className="text-[#181818] leading-6 text-[16px]">
                    ixan+ isn't just an eye supplement-it protects cells, tissues, and metabolic pathways impacted by oxidative stress.
                  </p>
                </div>
                <div>
                  <img src="/icons/research-icon.svg" alt="Research" className="mb-2 h-12 w-12" />
                  <h3 className="font-bold text-[16px] leading-6 mb-1">
                    4. Clinically Referenced Formulation
                  </h3>
                  <p className="text-[#181818] leading-6 text-[16px]">
                    Backed by CTRI: CTRI/2023/07/055671, ensuring scientific validation and safety.
                  </p>
                </div>

                <div>
                  <img src="/icons/approve-icon.svg" alt="Approve" className="mb-2 h-12 w-12" />
                  <h3 className="font-bold text-[16px] leading-6 mb-1">
                    5. Clean Label & Daily-Use Friendly
                  </h3>
                  <p className="text-[#181818] leading-6 text-[16px]">
                    100% vegetarian l No artificial colors l No preservatives l No fillers
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl p-16">
              <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">
                Know the Ingredients (Inside ixan+)
              </h2>
              <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                Discover the science-powered natural actives that make ixan+ a patented, proven, and powerful vision + retinal + metabolic wellness formula.
                Patented iXAN: An Anti-Inflammatory & Antioxidant Matrix of Curcuminoids & Xanthophylls:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {ingredients.map((item, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-bold text-[20px] leading-6 tracking-normal">{item.heading}</h4>

                    <p className="font-normal text-[16px] leading-6 tracking-normal">
                      {item.description}
                    </p>

                    <h5 className="font-bold text-[16px] leading-6 tracking-normal">
                      It helps:
                    </h5>

                    <p className="font-normal text-[16px] leading-6 tracking-normal">
                      {item.keyBenefits.map((benefit, i) => (
                        <span key={i}>
                          {benefit}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl p-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className=" grid grid-cols-1 gap-4">
                <div>
                  <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">
                    Why This Combination Works
                  </h2>
                  <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                    Each ingredient is powerful alone, but in ixan+ they form a synergistic antioxidant & anti-inflammatory matrix that protects:
                  </p>
                  <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                    Vision clarity
                    <br />
                    Retinal microvascular health
                    <br />
                    Macular pigment density
                    <br />
                    Cellular and metabolic balance
                    <br />
                    Eyes at risk of diabetic complications
                  </p>
                </div>
                <div>
                  <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">
                    Who Should Use ixan+?
                  </h2>

                  <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                    Individuals with high screen time
                    <br />
                    Those experiencing eye strain, dryness, or irritation
                    <br />
                    Adults wanting macular & retinal protection
                    <br />
                    Individuals with early signs of retinal stress
                    <br />
                    People living with or at risk of Diabetic Retinopathy
                    <br />
                    Anyone seeking a daily antioxidant + eye health supplement
                  </p>
                </div>
                <div>
                  <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">
                    How to Use
                  </h2>
                  <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                    1 capsule once a day as maintenance dose,
                    <br />
                    2 capsules a day for advanced support or as advised by the physician.
                  </p>
                  <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                    ixan+ is developed by Farm Fresh Bioworks (India) Pvt. Ltd., a science-led nutraceutical innovator.
                    From sustainable farming to bioactive extraction and clinical validation, we ensure transparency, quality,
                    and measurable efficacy.
                  </p>
                  <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                    Science-Driven. Nature-Powered.
                    <br />
                    Start the/your journey toward healthier eyes, resilient cells and long-term metabolic wellness with iXAN+.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">
                  Supplement Facts (Per Veg Capsule)
                </h2>
                <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                  Supplement Facts
                </p>
                <p className="font-normal text-[16px] leading-6 tracking-normal mb-4">
                  Serving Size: 1 Veg Capsule l Servings Per Container: 60
                </p>

                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3">Ingredients</th>
                      <th className="py-3">Amount per Capsule</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Curcuminoids</td>
                      <td className="py-3">60mg †</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3">Lutein</td>
                      <td className="py-3">10 mg †</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3">Trans Zeaxanthin</td>
                      <td className="py-3">1 mg †</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3">Bilberry Extract</td>
                      <td className="py-3">50 mg</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3">Licorice Extract</td>
                      <td className="py-3">25 mg</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3">Alpha Lipoic Acid</td>
                      <td className="py-3">25 mg</td>
                    </tr>

                    <tr className="border-b">
                      <td className="py-3">Zinc (as Zinc gluconate)</td>
                      <td className="py-3">10 mg</td>
                    </tr>
                  </tbody>
                </table>
                <p className="font-normal text-[16px] leading-6 tracking-normal mt-4">
                  † iXAN® is a Patented Matrix. Clinical Reference: CTRI/2023/07/055671
                </p>

                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="py-3 font-semibold">Nutrient</th>
                      <th className="py-3 font-semibold">Amount per Capsule</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3">Energy</td>
                      <td className="py-3">2 kcal</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-3">Protein</td>
                      <td className="py-3">&lt;0.01 g</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-3">Carbohydrate</td>
                      <td className="py-3">&lt;0.2 g</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-3">Sugar</td>
                      <td className="py-3">&lt;0.05 g</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-3">Fat</td>
                      <td className="py-3">&lt;0.05 g</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-3">Sodium</td>
                      <td className="py-3">&lt;50 mg</td>
                    </tr>
                  </tbody>
                </table>

                <p className="font-normal text-[16px] leading-6 tracking-normal mt-4">
                  ** RDA not established, *RDA as per ICMR 2020
                </p>
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl p-16">
              <h2 className="font-bold leading-[-1%]  text-[28px] mb-3">FAQs</h2>
              <div className=" grid grid-cols-2 gap-14">
                <Accordion items={faqs} />
                <Accordion items={faqs} />
              </div>
            </div>

            <div className=" rounded-xl mb-6">
              <h2 className="font-bold leading-[-1%]  text-[28px] text-[#FFFFFF] mb-6">
                Client Testimonials
              </h2>
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-[#023954] text-[#FFFFFF] rounded-xl px-9 py-12">
                    <p className="font-normal text-[20px] leading-7 tracking-normal mb-1">
                      {testimonial.title}
                    </p>
                    <p className="font-normal text-[20px] leading-7 tracking-normal mb-4">
                      {testimonial.message}
                    </p>
                    <p className="font-normal text-[20px] leading-7 tracking-normal">
                      - {testimonial.name}, {testimonial.city}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
