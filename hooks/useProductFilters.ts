import { useMemo } from "react";
import type { Product } from "@/types/product";

type SortBy = "priceAsc" | "priceDesc" | "nameAsc" | "default";

type Params = {
  products: Product[];
  inStockOnly: boolean;
  discountOnly: boolean;
  selectedCategory: string;
  search: string;
  maxPrice: number;
  sortBy: SortBy;
};

export const useProductFilters = ({
  products,
  inStockOnly,
  discountOnly,
  selectedCategory,
  search,
  maxPrice,
  sortBy,
}: Params) => {

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (inStockOnly) {
      result = result.filter(p => Number(p.stock || 0) > 0);
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description || "").toLowerCase().includes(query)
      );
    }

    result = result.filter(p => Number(p.price) <= maxPrice);

    if (discountOnly) {
      result = result.filter(
        p => Number(p.compareAtPrice || 0) > Number(p.price)
      );
    }

    if (sortBy === "priceAsc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "nameAsc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    products,
    inStockOnly,
    discountOnly,
    selectedCategory,
    search,
    maxPrice,
    sortBy,
  ]);

  return filteredProducts;
};
