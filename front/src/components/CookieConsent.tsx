"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#014545] px-4 py-4 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed">
          Nous utilisons uniquement des cookies essentiels pour assurer le bon fonctionnement du site.
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-[#014545] transition hover:bg-white/90"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
