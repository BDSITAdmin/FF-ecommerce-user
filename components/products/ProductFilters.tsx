type Props = {
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  discountOnly: boolean;
  setDiscountOnly: (v: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categories: string[];
  search: string;
  setSearch: (v: string) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
};

export default function ProductFilters({
  inStockOnly,
  setInStockOnly,
  discountOnly,
  setDiscountOnly,
  selectedCategory,
  setSelectedCategory,
  categories,
  search,
  setSearch,
  maxPrice,
  setMaxPrice,
}: Readonly<Props>) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products"
        className="w-full border p-2 rounded mb-4"
      />

      {/* Category */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        {categories.map(cat => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      {/* Stock */}
      <label className="block mb-2">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
        In Stock Only
      </label>

      {/* Discount */}
      <label className="block mb-4">
        <input
          type="checkbox"
          checked={discountOnly}
          onChange={(e) => setDiscountOnly(e.target.checked)}
        />
        Discount Only
      </label>

      {/* Price */}
      <input
        type="range"
        min={0}
        max={4000}
        value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value))}
        className="w-full"
      />
      <p>Max Price: Rs {maxPrice}</p>
    </div>
  );
}