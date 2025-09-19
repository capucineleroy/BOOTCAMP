"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { HeartIcon, CartIcon } from "./icons";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { open: openCartDrawer } = useCart();

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setUser(data.user ?? null);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleDropdown = () => {
    setDropdownOpen((previous) => !previous);
  };

  const goTo = (path: string) => {
    setDropdownOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setUser(null);
    router.push("/");
  };

  const userInitial = useMemo(() => {
    if (!user) {
      return null;
    }

    const rawFirstName = (user.user_metadata?.first_name || user.user_metadata?.firstName || user.user_metadata?.prenom) as string | undefined;

    return rawFirstName?.charAt(0)?.toUpperCase() ?? null;
  }, [user]);

  return (
    <header className="relative z-40 flex items-center bg-white px-6 py-4 shadow-sm">
      <Link href="/" className="ml-8 text-lg font-semibold text-[#014545]">
        Sneco
      </Link>
      <nav className="flex-1 hidden justify-center gap-8 text-sm font-medium text-neutral-700 md:flex">
        <Link href="/new" className="transition-colors hover:text-[#014545]">
          Nouveautés
        </Link>
        <Link href="/shop" className="transition-colors hover:text-[#014545]">
          Catalogue
        </Link>
        <Link href="/brand" className="transition-colors hover:text-[#014545]">
          Notre projet
        </Link>
      </nav>
      <div className="flex items-center gap-6">
        {!user ? (
          <Link href="/login" className="text-sm font-semibold text-[#014545] transition-colors hover:text-[#016a6a]">
            Se connecter
          </Link>
        ) : (
          <>
            <Link href="/favorites" className="text-neutral-600 transition-colors hover:text-[#014545]" aria-label="Favoris">
              <HeartIcon className="h-6 w-6" />
            </Link>
            <button
              type="button"
              onClick={openCartDrawer}
              className="text-neutral-600 transition-colors hover:text-[#014545]"
              aria-label="Panier"
            >
              <CartIcon className="h-6 w-6" />
            </button>
            <div className="relative">
              <button
                ref={triggerRef}
                type="button"
                onClick={toggleDropdown}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#014545] text-sm font-bold text-white transition-colors hover:bg-[#016a6a]"
              >
                {userInitial ?? "?"}
              </button>
              {dropdownOpen ? (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white py-2 shadow-md z-50"
                >
                  <button
                    type="button"
                    onClick={() => goTo("/orders")}
                    className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-[#014545] hover:text-white"
                  >
                    Historique d'achat
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo("/account")}
                    className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-[#014545] hover:text-white"
                  >
                    Gestion de compte
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-[#014545] hover:text-white"
                  >
                    Se deconnecter
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
