"use client";
import Link from 'next/link';
import { useState } from 'react';
import { CartIcon, MenuIcon, SearchIcon, UserIcon, HeartIcon } from './icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { count, toggle } = useCart();
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    router.push(`/shop?${params.toString()}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <button className="sm:hidden p-2" onClick={() => setOpen((v) => !v)}>
            <MenuIcon className="w-6 h-6" />
          </button>
          <Link href="/" className="text-lg font-semibold tracking-tight">SESSILE</Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-700">
            <Link href="/shop" className="hover:text-black">E-shop</Link>
            <Link href="/brand" className="hover:text-black">Brand</Link>
            <Link href="/new" className="hover:text-black">New Arrivals</Link>
            {(role === 'seller' || role === 'admin') && (
              <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
            )}
          </nav>
        </div>

        <form onSubmit={submitSearch} className="hidden sm:flex items-center gap-2 w-[360px] max-w-full">
          <div className="relative flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sneakers..."
              className="w-full rounded-full border px-4 py-2 pl-10 text-sm outline-none focus:ring-2 ring-[color:var(--color-brand-2)]"
            />
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <Link href="/favorites" className="p-2 text-neutral-700 hover:text-black" aria-label="Favorites">
            <HeartIcon className="w-6 h-6" />
          </Link>
          <Link href={user ? '/account' : '/login'} className="p-2 text-neutral-700 hover:text-black" aria-label="Account">
            <UserIcon className="w-6 h-6" />
          </Link>
          <button onClick={toggle} className="relative p-2 text-neutral-700 hover:text-black" aria-label="Cart">
            <CartIcon className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[color:var(--color-brand-2)] text-white">{count}</span>
            )}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="sm:hidden border-t bg-white">
          <form onSubmit={submitSearch} className="p-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sneakers..."
                className="w-full rounded-full border px-4 py-2 pl-10 text-sm outline-none focus:ring-2 ring-[color:var(--color-brand-2)]"
              />
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            </div>
          </form>
          <nav className="px-4 pb-4 flex flex-col gap-2 text-sm">
            <Link href="/shop" onClick={() => setOpen(false)} className="py-2">E-shop</Link>
            <Link href="/brand" onClick={() => setOpen(false)} className="py-2">Brand</Link>
            <Link href="/new" onClick={() => setOpen(false)} className="py-2">New Arrivals</Link>
            {(role === 'seller' || role === 'admin') && <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2">Dashboard</Link>}
            {user ? (
              <button onClick={() => { logout(); setOpen(false); }} className="text-left py-2 text-rose-600">Logout</button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="py-2">Login</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

