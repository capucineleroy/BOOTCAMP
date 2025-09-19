"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

const AUTH_ROUTES = new Set(["/login", "/register"]);

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname ? AUTH_ROUTES.has(pathname) : false;

  return isAuthPage ? <main className="min-h-[70vh]">{children}</main> : (
    <>
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
