"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Identifiants invalides.";
      setFormError(message);
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
            href="/"
            className="mb-6 inline-flex items-center text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Retour à l'accueil
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-900">Connexion</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Accedez à votre espace pour suivre vos commandes et profiter de notre marque.
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
            <div>
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[#018D5B] focus:outline-none focus:ring-2 focus:ring-[#30c890]/30"
                autoComplete="current-password"
                required
              />
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs font-semibold text-[#018D5B] transition hover:text-[#02a56d]">
                  Mot de passe oublie ?
                </Link>
              </div>
            </div>
            {formError ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#018D5B] py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#02a56d] focus:outline-none focus:ring-2 focus:ring-[#49d9ab]/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p className="mt-6 text-sm text-neutral-500">
            Pas encore de compte ?
            <Link href="/register" className="ml-2 font-semibold text-[#018D5B] hover:text-[#02a56d]">
              Créer un compte
            </Link>
          </p>
          <p className="mt-4 text-xs text-neutral-400">
            Astuce: utilisez admin@example.com ou seller@example.com pour tester la navigation selon le role.
          </p>
        </div>
      </div>
    </div>
  );
}
