'use client'
import ProductCard from "../../components/ProductCard";
import { products } from "../../lib/data";
import { SearchIcon } from '../../components/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function ShopPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q ?? '').toLowerCase();
  const list = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  const [open, setOpen] = useState(false);
  const [p, setQ] = useState('');
  const router = useRouter();
  
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    router.push(`/shop?${params.toString()}`);
    setOpen(false);
  };
  return (
    <div className="container py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-semibold">E-shop</h1>
            <form onSubmit={submitSearch} className="hidden sm:flex items-center gap-2 w-[360px] max-w-full">
              <div className="relative flex-1">
                <input
                  value={p}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search sneakers..."
                  className="w-full rounded-full border border-[#014545] px-4 py-2 pl-10 text-sm outline-none focus:ring-2 ring-[#014545]"
                />
                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </form>
          </div>
          {q && <p className="text-sm text-neutral-600">Results for "{q}"</p>}
          
        </div>
        <div className="text-sm text-neutral-600">{list.length} products</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

