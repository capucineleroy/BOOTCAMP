"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { HeartIcon, CartIcon, MenuIcon, UserIcon } from "./icons";

const NAV_LINKS = [
  { href: "/new", label: "Nouveautes" },
  { href: "/shop", label: "Catalogue" },
  { href: "/brand", label: "Notre projet" },
];

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const getNavLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `transition-colors hover:text-[#014545] ${isActive ? "text-[#014545]" : "text-neutral-700"}`;
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="relative z-40 border-b border-neutral-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex w-full items-center md:hidden">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-400"
                aria-label="Ouvrir le menu"
                aria-expanded={mobileMenuOpen}
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <Link href="/" className="flex-1 text-center text-lg font-semibold uppercase tracking-wide text-[#014545]">
                Sneco
              </Link>
              <div className="ml-3 flex items-center gap-4 text-neutral-700">
                <Link href="/favorites" className="transition-colors hover:text-[#014545]" aria-label="Favoris">
                  <HeartIcon className="h-6 w-6" />
                </Link>
                <Link href="/account" className="transition-colors hover:text-[#014545]" aria-label="Mon compte">
                  <UserIcon className="h-6 w-6" />
                </Link>
                <button
                  type="button"
                  onClick={openCartDrawer}
                  className="transition-colors hover:text-[#014545]"
                  aria-label="Panier"
                >
                  <CartIcon className="h-6 w-6" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/" className="text-lg font-semibold uppercase tracking-wide text-[#014545]">
                Sneco
              </Link>
              <Link href="/login" className="ml-auto text-sm font-semibold text-[#014545] transition-colors hover:text-[#016a6a]">
                Se connecter
              </Link>
            </>
          )}
        </div>

        <div className="hidden w-full items-center md:flex">
          <Link href="/" className="text-lg font-semibold uppercase tracking-wide text-[#014545]">
            Sneco
          </Link>
          <nav className="mx-auto flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={getNavLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
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
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                  >
                    {userInitial ?? "?"}
                  </button>
                  {dropdownOpen ? (
                    <div
                      ref={menuRef}
                      className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-neutral-200 bg-white py-2 shadow-md"
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
        </div>
      </div>

      {user ? (
        <div className={`${mobileMenuOpen ? "md:hidden" : "hidden"}`}>
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={closeMobileMenu} aria-hidden="true" />
            <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white px-6 py-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold uppercase tracking-wide text-[#014545]">Menu</span>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400"
                  aria-label="Fermer le menu"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-4 text-base font-medium text-neutral-800">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeMobileMenu} className="rounded-full px-2 py-2 transition-colors hover:bg-[#014545]/10">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-sm font-medium text-neutral-700">
                <Link href="/orders" onClick={closeMobileMenu} className="rounded-full px-2 py-2 transition-colors hover:bg-[#014545]/10">
                  Historique d'achat
                </Link>
                <Link href="/account" onClick={closeMobileMenu} className="rounded-full px-2 py-2 transition-colors hover:bg-[#014545]/10">
                  Gestion de compte
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="rounded-full px-2 py-2 text-left transition-colors hover:bg-[#014545]/10"
                >
                  Se deconnecter
                </button>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </header>
  );
}
