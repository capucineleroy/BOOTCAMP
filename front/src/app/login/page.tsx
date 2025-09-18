"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
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
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50 lg:flex-row">
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 text-neutral-900 shadow-lg sm:px-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="text-sm uppercase tracking-[0.3em] text-[color:var(--color-brand-4)]">Bienvenue</span>
            <h1 className="mt-3 text-3xl font-semibold text-neutral-900">Connexion</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Accedez a votre espace pour suivre vos commandes et profiter de notre marque.
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
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[color:var(--color-brand-4)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-4)]/40"
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
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[color:var(--color-brand-4)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-4)]/40"
                autoComplete="current-password"
                required
              />
            </div>
            {formError ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[color:var(--color-brand-4)] to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-500 hover:to-[color:var(--color-brand-4)] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p className="mt-6 text-sm text-neutral-500">
            Pas encore de compte ?
            <Link href="/register" className="ml-2 font-semibold text-[color:var(--color-brand-4)] hover:underline">
              Creer un compte
            </Link>
          </p>
          <p className="mt-4 text-xs text-neutral-400">
            Astuce: utilisez admin@example.com ou seller@example.com pour tester la navigation selon le role.
          </p>
        </div>
      </div>
      <div className="relative hidden flex-1 items-stretch justify-center overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f1fff] via-[#6320ee] to-[#14192d]" />
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-16 text-white">
          <div>
            <h2 className="text-3xl font-semibold">Plateforme digitale</h2>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Visualisez vos achats responsables et suivez leur impact environnemental en temps reel.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Mode durable</p>
        </div>
      </div>
    </div>
  );
}
