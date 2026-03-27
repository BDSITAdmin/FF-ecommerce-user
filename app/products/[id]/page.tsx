"use client";

import { useParams } from "next/navigation";
import ProductDetails from "../../../components/ProductDetails";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetails productId={id} />;
}
