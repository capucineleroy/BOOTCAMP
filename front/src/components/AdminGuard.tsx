"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, initialized } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize before deciding
    if (!initialized) return;
    if (role === "guest" || role === "client" || role === "seller") {
      router.replace("/login");
    }
  }, [role, router]);

  // While auth not initialized, show nothing (or a loading state)
  if (!initialized) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (role !== "admin") {
    return (
      <div className="container py-8">
        <h1 className="text-xl font-semibold">Acces restreint</h1>
        <p className="mt-2 text-sm text-neutral-600">Vous devez etre administrateur pour acceder a cette page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
