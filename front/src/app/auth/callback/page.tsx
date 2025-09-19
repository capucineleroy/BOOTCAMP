"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "processing" | "success" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("Verification en cours...");

  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    if (errorDescription) {
      setStatus("error");
      setMessage(errorDescription);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Code de verification manquant.");
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const exchangeCode = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("success");
      setMessage("Email confirme. Redirection...");
      timeout = setTimeout(() => router.replace("/"), 1500);
    };

    exchangeCode();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [code, errorDescription, router]);

  return (
    <div className="container max-w-md py-10">
      <div className="rounded border px-6 py-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Confirmation</h1>
        <p className="text-sm text-neutral-600">{message}</p>
        {status === "processing" ? (
          <p className="mt-6 text-sm text-neutral-500">Merci de patienter...</p>
        ) : null}
        {status === "error" ? (
          <button
            type="button"
            className="mt-6 rounded bg-[color:var(--color-brand-4)] px-4 py-2 text-sm text-white"
            onClick={() => router.replace("/")}
          >
            Retour à l'accueil
          </button>
        ) : null}
      </div>
    </div>
  );
}
