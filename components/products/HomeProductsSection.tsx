"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import api from "@/services/api";
import type { Product } from "@/types/product";
import { addToCart } from "@/store/cartSlice";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ShoppingBag,
  Star,
  Heart,
  ShoppingCart,
} from "lucide-react";

export default function HomeProductsSection() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: { user: { user: unknown } }) => state.user.user);
  const cartItems = useSelector((state: { cart: { items: unknown[] } }) => state.cart.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(4000);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    api
      .get("/api/v1/products", {
        params: {
          page: 1,
          limit: 40,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      })
      .then((res) => {
        const apiProducts = res?.data?.data?.products ?? [];
        const productsWithRating = apiProducts.map((p: Product) => ({
          ...p,
          rating: Math.floor(Math.random() * 5) + 1,
          reviews: Math.floor(Math.random() * 100),
        }));
        setProducts(productsWithRating);
      })
      .catch(() => {
        setError("Failed to load products.");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  const filteredProducts = [...products]
    .filter((p) => (inStockOnly ? Number(p.stock || 0) > 0 : true))
    .filter((p) => (selectedCategory !== "All" ? p.category === selectedCategory : true))
    .filter((p) =>
      search.trim()
        ? p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter((p) => Number(p.price) <= maxPrice)
    .filter((p) => (discountOnly ? Number(p.compareAtPrice || 0) > Number(p.price) : true))
    .sort((a, b) => {
      if (sortBy === "priceAsc") return Number(a.price) - Number(b.price);
      if (sortBy === "priceDesc") return Number(b.price) - Number(a.price);
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const quickAddToCart = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    dispatch(addToCart(product));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Best Selling Products
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-full px-5 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="nameAsc">Name: A to Z</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <Link
                href="/cart"
                className="relative p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            className={`
              lg:w-80 lg:block transition-all duration-300
              ${isFilterOpen ? "block fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden"}
            `}
          >
            {isFilterOpen && (
              <div className="lg:hidden flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Availability</h4>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">In Stock Only</span>
                  </label>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Special Offers</h4>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={discountOnly}
                      onChange={(e) => setDiscountOnly(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Discounted Items Only</span>
                  </label>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-pointer"
                  >
                    <option value="All">All</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                  <input
                    type="range"
                    min={0}
                    max={4000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">Rs 0</span>
                    <span className="text-gray-400">to</span>
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                      Rs {maxPrice}
                    </span>
                  </div>
                </div>

                {(inStockOnly || discountOnly || selectedCategory !== "All" || maxPrice < 4000 || search) && (
                  <button
                    onClick={() => {
                      setInStockOnly(false);
                      setDiscountOnly(false);
                      setSelectedCategory("All");
                      setMaxPrice(4000);
                      setSearch("");
                    }}
                    className="w-full mt-4 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading && <p className="text-gray-600">Loading products...</p>}
            {!loading && error && <p className="text-red-600">{error}</p>}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <SlidersHorizontal className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 text-center mb-6">Try adjusting your filters or search term</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const price = Number(product.price);
                  const compareAt = Number(product.compareAtPrice || 0);
                  const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
                  const isInWishlist = wishlist.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                              {discount}% OFF
                            </span>
                          </div>
                        )}

                        <img
                          src={product.images?.[0] || "/api/placeholder/400/400"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all transform hover:scale-110"
                          >
                            {isInWishlist ? (
                              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            ) : (
                              <Heart className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={(e) => quickAddToCart(product, e)}
                            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </button>
                        </div>
                      </Link>

                      <div className="p-5">
                        <Link href={`/products/${product.id}`} className="block">
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-emerald-600 transition-colors line-clamp-2 min-h-[56px]">
                            {product.name}
                          </h3>

                          {product.rating && (
                            <div className="flex items-center gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < product.rating!
                                    ? "text-emerald-400 fill-emerald-400"
                                    : "text-gray-300"
                                    }`}
                                />
                              ))}
                              <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mt-2">{product.category}</p>

                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">Rs {price.toLocaleString()}</span>
                            {compareAt > price && (
                              <span className="text-sm text-gray-400 line-through">
                                Rs {compareAt.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
