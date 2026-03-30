"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { addToCartAsync } from "../store/cartSlice";
import Navbar from "./Navbar";
import Accordion from "./Accordion";
import IxanBottle from "@/public/assate/IxanBottle.png";

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
    heading: "Alpha Lipoic Acid (ALA) (25 mg)",
    description:
      "ALA is one of the few antioxidants that works in both fat and water-based tissues, giving whole-cell protection.",
    keyBenefits: [
      "Improve insulin sensitivity",
      "Support nerve & retinal cell protection",
      "Boost antioxidant recycling (Vitamin C, E, Glutathione)",
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
    name: "Arun M.",
    city: "Hyderabad",
    title: "Sharper vision & better night driving.",
    message:
      "I noticed clearer vision and reduced glare while driving at night. The improvement in contrast sensitivity is real.",
  },
  {
    name: "Sangeeta P.",
    city: "Pune",
    title: "Really helpful for early diabetic eye stress.",
    message:
      "I'm pre-diabetic and had mild retinal changes. My ophthalmologist recommended antioxidants. IXAN+ has made my vision more stable and reduced flickering.",
  },
  {
    name: "Vani K.",
    city: "Chennai",
    title: "The only supplement that helped my dry, irritated eyes.",
    message:
      "Long screen hours made my eyes burn. IXAN+ brought noticeable relief and freshness. I feel less tired even after a full workday.",
  },
  {
    name: "Nikhil R.",
    city: "Mumbai",
    title: "Premium formula. Worth the price.",
    message:
      "The patented matrix and clean-label formula made me try it. My focus, eye comfort, and overall energy feel better.",
  },
  {
    name: "Pooja D.",
    city: "Gurgaon",
    title: "Great for people with high mobile/laptop use.",
    message:
      "My eyes used to feel heavy by evening. After a month on IXAN+, the discomfort has reduced significantly.",
  },
  {
    name: "Prakash K.",
    city: "Coimbatore",
    title: "Perfect for my mother who has early diabetic retinopathy.",
    message:
      "She feels her vision is steadier, and her doctor said her retinal stress markers look better. Very happy.",
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-10 sm:py-14 lg:py-20 px-4 sm:px-8 lg:px-16">

        {/* LEFT: IMAGE GALLERY */}
        <div className="w-full">

          {/* MAIN IMAGE */}
          <img
            src={galleryImages[selectedIndex] || "https://via.placeholder.com/400"}
            alt={product.name}
            className="w-full max-w-md mx-auto lg:max-w-full object-contain"
          />

          {/* THUMBNAILS */}
          {galleryImages.length > 1 && (
            <div className="mt-4">

              <div className="flex items-center justify-center gap-3">

                {/* PREV BUTTON */}
                <button
                  onClick={handlePrevImage}
                  className="h-8 w-8 flex items-center justify-center"
                >
                  <img src="/assate/left arrow.svg" alt="Previous" className="h-4 w-4" />
                </button>

                {/* THUMBNAILS */}
                <div className="flex gap-2 sm:gap-3 overflow-x-auto px-1">
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`rounded border-2 flex-shrink-0 ${selectedIndex === index
                        ? "border-[#2477DC]"
                        : "border-transparent"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${index}`}
                        className="h-16 w-12 sm:h-20 sm:w-14 object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* NEXT BUTTON */}
                <button
                  onClick={handleNextImage}
                  className="h-8 w-8 flex items-center justify-center"
                >
                  <img src="/assate/right arrow.svg" alt="Next" className="h-4 w-4" />
                </button>

              </div>

              {/* DOTS */}
              <div className="mt-3 flex justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`h-1.5 w-1.5 rounded-full ${selectedIndex === index
                      ? "bg-[#2477DC]"
                      : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>

            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT DETAILS */}
        <div className=" mt-6 sm:mt-12 sm:px-0 lg:px-8 ">

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {product.name}
          </h1>

          <h3 className="text-sm sm:text-2xl font-bold mt-2 mb-4">
            Powerful | Proven | Patented ixan+
          </h3>

          <p className="text-gray-600 text-sm sm:text-base mb-6">
            {product.description || "No description available"}
          </p>

          <p className="text-2xl sm:text-3xl font-semibold">
            Rs. {product.price}/-
          </p>

          <p className="text-gray-600 text-sm mb-6">
            Pack Size: 60 Veg Capsules (2-Month Pack)
          </p>

          {/* QUANTITY + BUTTON */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            {/* QUANTITY */}
            <div className="inline-flex items-center border border-[#C5C5C5] rounded-md">
              <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                className="h-10 w-10 text-lg hover:bg-gray-100"
              >
                -
              </button>

              <span className="w-10 text-center font-semibold">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="h-10 w-10 text-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto px-16 py-3 rounded-full bg-[#0065A6] text-white font-medium hover:opacity-90 transition"
            >
              Add to Cart
            </button>

          </div>

        </div>
      </div>

      <div className="bg-white p-0 lg:p-10 sm:p-10 flex justify-center">
        <div className="bg-[#0e6ea8] pl-8 py-8 Sm:pl-14 sm:py-14 pr-10 rounded-0 lg:rounded-2xl sm:rounded-2xl  ">
          <div className="max-w-304 space-y-10">
            <div className="bg-[#FFFFFF] rounded-xl px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

              {/* TEXT SECTION */}
              <div>
                <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] mb-3 leading-tight">
                  What is {product.name}?
                </h2>

                <p className="text-sm sm:text-base text-[#181818] leading-relaxed">
                  ixan+ is a patented, clinically validated antioxidant and anti-inflammatory formulation created to safeguard eyes from the constant stress of modern living.
                  <br /><br />
                  Daily exposure to digital screens, pollution, irregular meals, and chronic stress accelerates oxidative damage impacting the eyes first, as they are among the most sensitive organs in the body.
                  ixan+ brings together a powerful blend of Curcuminoids, Lutein, Zeaxanthin, Bilberry, Licorice, Alpha Lipoic Acid, and Zinc to form a synergistic matrix that works at multiple levels:
                  <br />
                  Supports ocular protection and strengthens retinal cells
                  <br />
                  Helps maintain visual performance under digital and environmental strain
                  <br />
                  Promotes metabolic balance, relevant for individuals at risk of or experiencing diabetic eye changes
                  <br /><br />
                  Formulated for modern lifestyles, ixan+ helps protect vision, naturally and effectively.
                </p>
              </div>

              {/* IMAGE SECTION */}
              <div className="flex justify-center">
                <div className="bg-[#0065A6] rounded-full 
        w-52 h-52 
        sm:w-64 sm:h-64 
        md:w-80 md:h-80 
        lg:w-[420px] lg:h-[420px] 
        flex items-center justify-center">

                  <img
                    src={IxanBottle.src}
                    alt="product image"
                    className="object-contain 
          w-40 sm:w-48 md:w-60 lg:w-[360px] 
          mt-6 sm:mt-10 lg:mt-16"
                  />
                </div>
              </div>

            </div>

            <div className="bg-[#FFFFFF] rounded-xl px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-20 grid grid-cols-1 gap-8">

              {/* HEADING */}
              <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug tracking-tight">
                What Makes {product.name} Different?
              </h2>

              {/* GRID ITEMS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* ITEM 1 */}
                <div>
                  <img src="/icons/protect-icon.svg" alt="Protect" className="mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                  <h3 className="font-bold text-sm sm:text-base leading-5 sm:leading-6 mb-1">
                    1. Synergistic Antioxidant & Anti-inflammatory Matrix (Patented)
                  </h3>
                  <p className="text-[#181818] text-sm sm:text-base leading-relaxed">
                    Curcuminoids + Lutein + Zeaxanthin work together to neutralize oxidative damage and support retinal pigment density.
                  </p>
                </div>

                {/* ITEM 2 */}
                <div>
                  <img src="/icons/eye-icon.svg" alt="Eye" className="mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                  <h3 className="font-bold text-sm sm:text-base leading-5 sm:leading-6 mb-1">
                    2. Retina-Targeted Protection
                  </h3>
                  <p className="text-[#181818] text-sm sm:text-base leading-relaxed">
                    Ingredients like Bilberry, ALA, and Zinc provide micro-vascular support essential for retinal health especially in conditions like Diabetic Retinopathy.
                  </p>
                </div>

                {/* ITEM 3 */}
                <div>
                  <img src="/icons/nuclie-icon.svg" alt="Nuclie" className="mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                  <h3 className="font-bold text-sm sm:text-base leading-5 sm:leading-6 mb-1">
                    3. Cellular + Organ Wellness
                  </h3>
                  <p className="text-[#181818] text-sm sm:text-base leading-relaxed">
                    ixan+ isn't just an eye supplement—it protects cells, tissues, and metabolic pathways impacted by oxidative stress.
                  </p>
                </div>

                {/* ITEM 4 */}
                <div>
                  <img src="/icons/research-icon.svg" alt="Research" className="mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                  <h3 className="font-bold text-sm sm:text-base leading-5 sm:leading-6 mb-1">
                    4. Clinically Referenced Formulation
                  </h3>
                  <p className="text-[#181818] text-sm sm:text-base leading-relaxed">
                    Backed by CTRI: CTRI/2023/07/055671, ensuring scientific validation and safety.
                  </p>
                </div>

                {/* ITEM 5 */}
                <div>
                  <img src="/icons/approve-icon.svg" alt="Approve" className="mb-3 h-10 w-10 sm:h-12 sm:w-12" />
                  <h3 className="font-bold text-sm sm:text-base leading-5 sm:leading-6 mb-1">
                    5. Clean Label & Daily-Use Friendly
                  </h3>
                  <p className="text-[#181818] text-sm sm:text-base leading-relaxed">
                    100% vegetarian | No artificial colors | No preservatives | No fillers
                  </p>
                </div>

              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-16">

              {/* HEADING */}
              <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug mb-3">
                Know the Ingredients (Inside ixan+)
              </h2>

              {/* DESCRIPTION */}
              <p className="text-sm sm:text-base leading-relaxed mb-6">
                Discover the science-powered natural actives that make ixan+ a patented, proven, and powerful vision + retinal + metabolic wellness formula.<br />
                Patented iXAN: An Anti-Inflammatory & Antioxidant Matrix of Curcuminoids & Xanthophylls:
              </p>

              {/* INGREDIENT GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">

                {ingredients.map((item, index) => (
                  <div key={index} className="space-y-2">

                    {/* HEADING */}
                    <h4 className="font-bold text-base sm:text-lg lg:text-[20px] leading-6">
                      {item.heading}
                    </h4>

                    {/* DESCRIPTION */}
                    <p className="text-sm sm:text-base leading-relaxed">
                      {item.description}
                    </p>

                    {/* SUB TITLE */}
                    <h5 className="font-semibold text-sm sm:text-base mt-2">
                      It helps:
                    </h5>

                    {/* BENEFITS LIST */}
                    <ul className="text-sm sm:text-base leading-relaxed list-disc pl-5">
                      {item.keyBenefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>

                  </div>
                ))}

              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* LEFT CONTENT */}
              <div className="space-y-8">

                {/* SECTION 1 */}
                <div>
                  <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug mb-3">
                    Why This Combination Works
                  </h2>

                  <p className="font-figtree font-normal text-base leading-6 tracking-normal sm:text-base leading-relaxed mb-4">
                    Each ingredient is powerful alone, but in ixan+ they form a synergistic antioxidant & anti-inflammatory matrix that protects:
                  </p>

                  <ul className="list-disc pl-5 font-figtree font-normal text-base leading-6 tracking-normal sm:text-base leading-relaxed space-y-1">
                    <li>Vision clarity</li>
                    <li>Retinal microvascular health</li>
                    <li>Macular pigment density</li>
                    <li>Cellular and metabolic balance</li>
                    <li>Eyes at risk of diabetic complications</li>
                  </ul>
                </div>

                {/* SECTION 2 */}
                <div>
                  <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug mb-3">
                    Who Should Use ixan+?
                  </h2>

                  <ul className="list-disc pl-5 font-figtree font-normal text-base leading-6 tracking-normal sm:text-base space-y-1">
                    <li>Individuals with high screen time</li>
                    <li>Those experiencing eye strain, dryness, or irritation</li>
                    <li>Adults wanting macular & retinal protection</li>
                    <li>Individuals with early signs of retinal stress</li>
                    <li>People living with or at risk of Diabetic Retinopathy</li>
                    <li>Anyone seeking a daily antioxidant + eye health supplement</li>
                  </ul>
                </div>

                {/* SECTION 3 */}
                <div>
                  <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug mb-3">
                    How to Use
                  </h2>

                  <p className="font-figtree font-normal text-base leading-6 tracking-normal sm:text-base mb-4">
                    1 capsule once a day as maintenance dose,<br />
                    2 capsules a day for advanced support or as advised by the physician.
                  </p>

                  <p className="font-figtree font-normal text-base leading-6 tracking-normal sm:text-base  mb-4">
                    ixan+ is developed by Farm Fresh Bioworks (India) Pvt. Ltd., a science-led nutraceutical innovator.  From sustainable farming to bioactive extraction and clinical validation, we ensure transparency, quality, and measurable efficacy.
                  </p>

                  <p className="font-figtree font-normal text-base leading-6 tracking-normal sm:text-base ">
                    Science-Driven. Nature-Powered.<br />
                    Start your journey toward healthier eyes, resilient cells and long-term metabolic wellness with iXAN+.
                  </p>
                </div>

              </div>

              {/* RIGHT CONTENT (TABLES) */}
              <div>

                <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug mb-3">
                  Supplement Facts (Per Veg Capsule)
                </h2>

                <p className="font-figtree font-normal text-base leading-6 tracking-normal sm:text-base mb-2">
                  Supplement Facts <br />
                  Serving Size: 1 Veg Capsule | Servings Per Container: 60
                </p>

                {/* TABLE WRAPPER (SCROLL ON MOBILE) */}
                <div className="overflow-x-auto">

                  <table className="w-3/4 text-left text-sm sm:text-base ">
                    <thead>
                      <tr>
                        <th className="py-3 px-3">Ingredients</th>
                        <th className="py-3 px-3">Amount per Capsule</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[
                        ["Curcuminoids", "60 mg"],
                        ["Lutein", "10 mg"],
                        ["Trans Zeaxanthin", "1 mg"],
                        ["Bilberry Extract", "50 mg"],
                        ["Licorice Extract", "25 mg"],
                        ["Alpha Lipoic Acid", "25 mg"],
                        ["Zinc (as Zinc gluconate)", "10 mg"],
                      ].map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-3">{row[0]}</td>
                          <td className="py-2 px-3">{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>

                <p className=" mt-2 sm:mt-12 font-figtree font-normal text-base leading-6 tracking-normal">
                  † iXAN® is a Patented Matrix. Clinical Reference: CTRI/2023/07/055671
                </p>

                {/* SECOND TABLE */}
                <div className="overflow-x-auto mt-6">

                  <table className="w-96 text-left text-sm sm:text-base ">
                    <thead>
                      <tr>
                        <th className="py-3 px-3">Nutrient</th>
                        <th className="py-3 px-3">Amount per Capsule</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[
                        ["Energy", "2 kcal"],
                        ["Protein", "<0.01 g"],
                        ["Carbohydrate", "<0.2 g"],
                        ["Sugar", "<0.05 g"],
                        ["Fat", "<0.05 g"],
                        ["Sodium", "<50 mg"],
                      ].map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-3">{row[0]}</td>
                          <td className="py-2 px-3">{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>

                <p className="text-sm mt-3">
                  ** RDA not established, *RDA as per ICMR 2020
                </p>

              </div>

            </div>

            <div className="bg-[#FFFFFF] rounded-xl px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-16">

              {/* HEADING */}
              <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] leading-snug mb-6">
                FAQs
              </h2>

              {/* ACCORDION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                <Accordion items={faqs} />
                <Accordion items={faqs} />
              </div>

            </div>

            <div className="rounded-xl mb-10 px-0 sm:px-8 lg:px-16 py-0 sm:py-14 lg:py-16">

              {/* HEADING */}
              <h2 className="font-bold text-xl sm:text-2xl lg:text-[28px] text-white mb-6 leading-snug">
                Client Testimonials
              </h2>

              {/* TESTIMONIAL GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">

                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-[#023954] text-white rounded-xl px-5 sm:px-6 lg:px-9 py-6 sm:py-8 lg:py-12 shadow-sm hover:shadow-lg transition duration-300"
                  >

                    {/* TITLE */}
                    <p className="text-base sm:text-lg lg:text-[20px] leading-relaxed mb-1">
                      {testimonial.title}
                    </p>

                    {/* MESSAGE */}
                    <p className="text-base sm:text-lg lg:text-[20px] leading-relaxed mb-4">
                      {testimonial.message}
                    </p>

                    {/* NAME */}
                    <p className="text-sm sm:text-base lg:text-[18px] opacity-90">
                      — {testimonial.name}, {testimonial.city}
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
