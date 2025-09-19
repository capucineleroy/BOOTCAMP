"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Impossible d'envoyer le lien de réinitialisation.";
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
            Retour à la connexion
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-900">Mot de passe oublie</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Saisissez l'adresse email associée à votre compte Sneco. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[#018D5B] focus:outline-none focus:ring-2 focus:ring-[#30c890]/30"
                autoComplete="email"
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
                Nous avons envoyé un email de réinitialisation. Vérifiez votre boîte de réception.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#018D5B] py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#02a56d] focus:outline-none focus:ring-2 focus:ring-[#49d9ab]/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
