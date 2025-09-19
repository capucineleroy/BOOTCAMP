"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery")) {
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
              setError("Lien invalide ou expir?.");
            }
          });
        }
      });
    } else {
      setError("Lien de r?initialisation invalide.");
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caract?res.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.updateUser({ password });
      if (resetError) {
        throw resetError;
      }
      setSuccess(true);
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Impossible de mettre ? jour le mot de passe.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 lg:flex-row lg:bg-neutral-950 lg:text-neutral-50">
      <div className="relative hidden w-full bg-neutral-950 lg:order-last lg:block lg:flex-1 lg:min-h-screen">
        <Image
          src="/photo%20green%20vue%20de%20haut.jpeg"
          alt="Vue plongeante d'une chaussure verte"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="flex w-full items-center justify-center px-6 py-12 shadow-lg sm:px-12 lg:order-first lg:w-1/2 lg:bg-white lg:text-neutral-900 lg:px-16">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Retour ? la connexion
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-900">D?finir un nouveau mot de passe</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Saisissez votre nouveau mot de passe puis confirmez-le.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-neutral-700">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[#018D5B] focus:outline-none focus:ring-2 focus:ring-[#30c890]/30"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[#018D5B] focus:outline-none focus:ring-2 focus:ring-[#30c890]/30"
                required
              />
            </div>
            {error ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {success ? (
              <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Mot de passe mis ? jour. Redirection vers la connexion...
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#018D5B] py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#02a56d] focus:outline-none focus:ring-2 focus:ring-[#49d9ab]/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mise ? jour..." : "Mettre ? jour"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
