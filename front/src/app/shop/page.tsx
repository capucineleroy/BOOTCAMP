"use client";
import ProductCard from "../../components/ProductCard";
import { fetchProducts } from "../../lib/supabaseApi";
import { SearchIcon } from "../../components/icons";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Product } from '../../lib/types';
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

  // keep currentPage in sync with URL
  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((res) => { if (mounted) setProductsState(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSearchValue(rawQuery);
  }, [rawQuery]);

  const list = useMemo(
    () =>
      normalizedQuery
        ? productsState.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
        : productsState,
    [normalizedQuery, productsState]
  );

  const PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginated = useMemo(() => {
    const start = (clampedPage - 1) * PER_PAGE;
    return list.slice(start, start + PER_PAGE);
  }, [list, clampedPage]);

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

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-semibold">Catalogue</h1>
            <form onSubmit={submitSearch} className="hidden w-[360px] max-w-full items-center gap-2 sm:flex">
              <div className="relative flex-1">
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search sneakers..."
                  className="w-full rounded-full border border-[#014545] px-4 py-2 pl-10 text-sm outline-none focus:ring-2 ring-[#014545]"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              </div>
            </form>
          </div>
          {trimmedQuery && (
            <p className="text-sm text-neutral-600">Results for "{trimmedQuery}"</p>
          )}
        </div>
        <div className="text-sm text-neutral-600">{list.length} products</div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={clampedPage <= 1}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Prev
        </button>

        {/* If few pages show all page buttons, else show window around current page */}
        <div className="flex items-center gap-1">
          {totalPages <= 7
            ? Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  aria-current={p === clampedPage ? "page" : undefined}
                  className={`px-3 py-1 rounded border ${p === clampedPage ? "bg-neutral-200" : ""}`}
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
                        <button onClick={() => goToPage(1)} className="px-2 py-1 rounded border">1</button>
                        {start > 2 && <span className="px-2">…</span>}
                      </>
                    )}
                    {pages.map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-3 py-1 rounded border ${p === clampedPage ? "bg-neutral-200" : ""}`}
                      >
                        {p}
                      </button>
                    ))}
                    {end < totalPages && (
                      <>
                        {end < totalPages - 1 && <span className="px-2">…</span>}
                        <button onClick={() => goToPage(totalPages)} className="px-2 py-1 rounded border">
                          {totalPages}
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
        </div>

        <button
          onClick={handleNext}
          disabled={clampedPage >= totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="mt-3 text-center text-sm text-neutral-600">
        Page {clampedPage} / {totalPages}
      </div>
    </div>
  );
}
