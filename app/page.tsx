"use client";

import { useEffect, useState } from "react";
import { getProducts } from "../services/product.service";
import ProductDetails from "../components/ProductDetails";

const getFirstProductId = (products: any[]) => {
  const first = products?.[0];
  return first?.id ?? first?._id ?? first?.productId ?? "";
};

export default function Home() {
  const [productId, setProductId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getProducts()
      .then((products) => {
        if (!active) return;
        const id = getFirstProductId(products);
        setProductId(id ? String(id) : "");
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!productId) return <div className="p-10">No products available.</div>;

  return <ProductDetails productId={productId} />;
}
