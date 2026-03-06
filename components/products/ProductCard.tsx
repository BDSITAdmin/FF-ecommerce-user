import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <img
        src={product.images?.[0]}
        alt={product.name}
        className="w-full h-60 object-cover rounded-xl"
      />

      <h3 className="mt-3 font-semibold">{product.name}</h3>

      <p className="text-emerald-600 font-bold mt-2">
        Rs {Number(product.price).toLocaleString()}
      </p>
    </div>
  );
}
