"use client";
import ProductCard from "../../components/ProductCard";
import { fetchProducts } from "../../lib/supabaseApi";
import { FilterIcon, SearchIcon } from "../../components/icons";
import { ChangeEvent, FocusEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import type { Product } from "../../lib/types";
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawQuery = searchParams.get("q") ?? "";
  const trimmedQuery = rawQuery.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  const pageParam = (() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  })();

  const [searchValue, setSearchValue] = useState(rawQuery);
  const [productsState, setProductsState] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Product["category"][]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInputs, setPriceInputs] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categoryLabels: Record<Product["category"], string> = {
    Homme: "Homme",
    Femme: "Femme",
    Unisexe: "Unisexe",
  };
  const categoryOrder: Product["category"][] = ["Femme", "Homme", "Unisexe"];

  const filterOptions = useMemo(() => {
    const brandSet = new Set<string>();
    const categorySet = new Set<Product["category"]>();
    const sizeSet = new Set<string>();
    const prices: number[] = [];

    productsState.forEach((product) => {
      if (product.brand) brandSet.add(product.brand);
      categorySet.add(product.category);
      product.sizes.forEach((variant) => sizeSet.add(variant.size));
      prices.push(product.price);
    });

    const brands = Array.from(brandSet).sort((a, b) => a.localeCompare(b));
    const categories = Array.from(categorySet).sort((a, b) => {
      const orderA = categoryOrder.indexOf(a);
      const orderB = categoryOrder.indexOf(b);
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });
    const sizes = Array.from(sizeSet).sort((a, b) => Number(a) - Number(b));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    return {
      brands,
      categories,
      sizes,
      priceBounds: { min: minPrice, max: maxPrice },
    };
  }, [productsState]);

  const priceBounds = filterOptions.priceBounds;

  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((res) => {
        if (mounted) setProductsState(res);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSearchValue(rawQuery);
  }, [rawQuery]);

  useEffect(() => {
    const { min, max } = priceBounds;
    if (!priceInitialized && (min !== 0 || max !== 0 || productsState.length > 0)) {
      setPriceRange([min, max]);
      setPriceInitialized(true);
    }
  }, [priceBounds, priceInitialized, productsState.length]);

  useEffect(() => {
    setPriceInputs({ min: String(priceRange[0]), max: String(priceRange[1]) });
  }, [priceRange]);
  
  const minPrice = priceInitialized ? priceRange[0] : priceBounds.min;
  const maxPrice = priceInitialized ? priceRange[1] : priceBounds.max;

  const filteredProducts = useMemo(() => {
    return productsState.filter((product) => {
      const brand = product.brand ?? "Sneaco";
      if (normalizedQuery && !product.name.toLowerCase().includes(normalizedQuery)) {
        return false;
      }
      if (selectedBrands.length && !selectedBrands.includes(brand)) {
        return false;
      }
      if (selectedCategories.length && !selectedCategories.includes(product.category)) {
        return false;
      }
      if (
        selectedSizes.length &&
        !product.sizes.some((variant) => selectedSizes.includes(variant.size))
      ) {
        return false;
      }
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }
      return true;
    });
  }, [productsState, normalizedQuery, selectedBrands, selectedCategories, selectedSizes, minPrice, maxPrice]);

  const PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginated = useMemo(() => {
    const start = (clampedPage - 1) * PER_PAGE;
    return filteredProducts.slice(start, start + PER_PAGE);
  }, [filteredProducts, clampedPage]);

  const updateUrl = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = searchValue.trim();
    if (trimmed) params.set("q", trimmed);
    // reset to page 1 on new search
    params.set("page", "1");
    updateUrl(params);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("q", trimmedQuery);
    params.set("page", String(page));
    updateUrl(params);
  };

  const handlePrev = () => {
    if (clampedPage > 1) goToPage(clampedPage - 1);
  };
  const handleNext = () => {
    if (clampedPage < totalPages) goToPage(clampedPage + 1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (category: Product["category"]) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
    );
  };

  const handlePriceInputChange = (index: 0 | 1) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPriceInputs((prev) => ({
      ...prev,
      [index === 0 ? "min" : "max"]: value,
    }));
  };

  const applyPriceInput = (index: 0 | 1, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (trimmed === "") {
      setPriceInputs((prev) => ({
        ...prev,
        [index === 0 ? "min" : "max"]: String(index === 0 ? minPrice : maxPrice),
      }));
      return;
    }

    const numeric = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(numeric)) {
      setPriceInputs((prev) => ({
        ...prev,
        [index === 0 ? "min" : "max"]: String(index === 0 ? minPrice : maxPrice),
      }));
      return;
    }

    setPriceRange((prev) => {
      const { min, max } = priceBounds;
      const [prevMin, prevMax] = prev;
      let nextMin = prevMin;
      let nextMax = prevMax;
      if (index === 0) {
        nextMin = Math.max(min, Math.min(numeric, prevMax));
      } else {
        nextMax = Math.min(max, Math.max(numeric, prevMin));
      }
      const nextRange: [number, number] = [nextMin, nextMax];
      setPriceInputs({ min: String(nextRange[0]), max: String(nextRange[1]) });
      return nextRange;
    });
  };

  const handlePriceInputBlur = (index: 0 | 1) => (event: FocusEvent<HTMLInputElement>) => {
    applyPriceInput(index, event.target.value);
  };

  const handlePriceInputKeyDown = (index: 0 | 1) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPriceInput(index, event.currentTarget.value);
    }
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setPriceInputs({ min: String(priceBounds.min), max: String(priceBounds.max) });
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    minPrice !== priceBounds.min ||
    maxPrice !== priceBounds.max;

  const FiltersContent = () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Genre</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            const label = categoryLabels[category] ?? category;
            return (
              <button
                type="button"
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  isSelected
                    ? "border-[#015A52] bg-[#015A52]/10 text-[#015A52]"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {label}
              </button>
            );
          })}
          {!filterOptions.categories.length && (
            <p className="text-xs text-neutral-400">Aucun genre disponible.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Marque</h3>
        <div className="mt-3 space-y-2">
          {filterOptions.brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-[#015A52] focus:ring-[#015A52]"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
          {!filterOptions.brands.length && (
            <p className="text-xs text-neutral-400">Aucune marque disponible.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Taille</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.sizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  isSelected
                    ? "border-[#015A52] bg-[#015A52]/10 text-[#015A52]"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {size}
              </button>
            );
          })}
          {!filterOptions.sizes.length && (
            <p className="text-xs text-neutral-400">Aucune taille disponible.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Prix</h3>
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex flex-col text-xs text-neutral-500">
              Min
              <input
                type="text"
                inputMode="decimal"
                value={priceInputs.min}
                onChange={handlePriceInputChange(0)}
                onBlur={handlePriceInputBlur(0)}
                onKeyDown={handlePriceInputKeyDown(0)}
                className="mt-1 w-28 rounded border border-neutral-200 px-3 py-2 text-sm focus:border-[#015A52] focus:outline-none focus:ring-2 focus:ring-[#015A52]/20"
                placeholder={`${priceBounds.min}`}
              />
            </label>
            <label className="flex flex-col text-xs text-neutral-500">
              Max
              <input
                type="text"
                inputMode="decimal"
                value={priceInputs.max}
                onChange={handlePriceInputChange(1)}
                onBlur={handlePriceInputBlur(1)}
                onKeyDown={handlePriceInputKeyDown(1)}
                className="mt-1 w-28 rounded border border-neutral-200 px-3 py-2 text-sm focus:border-[#015A52] focus:outline-none focus:ring-2 focus:ring-[#015A52]/20"
                placeholder={`${priceBounds.max}`}
              />
            </label>
          </div>
          <p className="text-xs text-neutral-500">
            Intervalle : {priceBounds.min} EUR - {priceBounds.max} EUR
          </p>
        </div>
      </section>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Catalogue</h1>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900 lg:hidden"
            >
              <FilterIcon className="h-4 w-4" />
              <span className="sr-only">Ouvrir les filtres</span>
            </button>
          </div>
          {trimmedQuery && (
            <p className="pt-4 text-sm text-neutral-600">Resultats pour "{trimmedQuery}"</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
          <form onSubmit={submitSearch} className="hidden w-[360px] max-w-full items-center gap-2 sm:flex">
            <div className="relative flex-1">
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search sneakers..."
                className="w-full rounded-full bg-[#F8F8F8] px-4 py-2 pl-10 text-sm outline-none focus:ring-1 ring-[#E8E8E8]"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
          </form>
          <div className="text-sm text-neutral-600">{filteredProducts.length} produits</div>
        </div>
      </div>

      {/* Mobile filters */}
      {isMobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
              <button
                type="button"
                className="text-sm text-neutral-500 hover:text-neutral-900"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Fermer
              </button>
            </div>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-neutral-500">{filteredProducts.length} produits</span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-[#015A52] disabled:opacity-40"
                disabled={!hasActiveFilters}
              >
                Reinitialiser
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto pr-2">
              <FiltersContent />
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-lg bg-[#015A52] py-3 text-sm font-semibold text-white"
            >
              Voir les resultats
            </button>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-[#015A52] disabled:opacity-40"
                disabled={!hasActiveFilters}
              >
                Reinitialiser
              </button>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <FiltersContent />
            </div>
          </div>
        </aside>

        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={clampedPage <= 1}
              className="px-3 py-1 rounded border border-neutral-300 disabled:bg-[#E8E8E8] cursor-pointer hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Precedent
            </button>

            <div className="flex items-center gap-1">
              {totalPages <= 7
                ? Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => goToPage(p)}
                      aria-current={p === clampedPage ? "page" : undefined}
                      className={`px-3 py-1 rounded border border-neutral-300 cursor-pointer hover:border-neutral-400 ${p === clampedPage ? "bg-neutral-200" : ""}`}
                    >
                      {p}
                    </button>
                  ))
                : (() => {
                    const windowSize = 5;
                    let start = Math.max(1, clampedPage - Math.floor(windowSize / 2));
                    let end = start + windowSize - 1;
                    if (end > totalPages) {
                      end = totalPages;
                      start = Math.max(1, end - windowSize + 1);
                    }
                    const pages: number[] = [];
                    for (let p = start; p <= end; p++) pages.push(p);
                    return (
                      <>
                        {start > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => goToPage(1)}
                              className="px-2 py-1 rounded border border-neutral-300 cursor-pointer hover:border-neutral-400"
                            >
                              1
                            </button>
                            {start > 2 && <span className="px-2">...</span>}
                          </>
                        )}
                        {pages.map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`px-3 py-1 rounded border border-neutral-300 cursor-pointer hover:border-neutral-400 ${p === clampedPage ? "bg-neutral-200" : ""}`}
                          >
                            {p}
                          </button>
                        ))}
                        {end < totalPages && (
                          <>
                            {end < totalPages - 1 && <span className="px-2">...</span>}
                            <button
                              type="button"
                              onClick={() => goToPage(totalPages)}
                              className="px-2 py-1 rounded border border-neutral-300 cursor-pointer hover:border-neutral-400"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={clampedPage >= totalPages}
              className="px-3 py-1 rounded border border-neutral-300 cursor-pointer hover:border-neutral-400 disabled:bg-[#E8E8E8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>

          <div className="mt-3 text-center text-sm text-neutral-600">
            Page {clampedPage} / {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}
