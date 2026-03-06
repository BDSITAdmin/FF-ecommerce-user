"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../services/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/cartSlice";
import Navbar from "../../../components/Navbar";

type Product = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data as Product))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <div className="p-10">Loading...</div>;

  return (
    <div>
      <Navbar />

      <div className="px-10 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <img
            src={product.image || "/placeholder.png"}
            className="w-full rounded shadow"
            alt={product.name}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-green-700 text-2xl font-semibold mb-4">Rs. {product.price}</p>

          <p className="text-gray-600 mb-6">
            {product.description || "No description available"}
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => dispatch(addToCart(product))}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-800"
            >
              Add to Cart
            </button>

            <button className="bg-yellow-400 px-6 py-3 rounded hover:scale-105 transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
