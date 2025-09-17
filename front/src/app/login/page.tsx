"use client";
import { FormEvent, useState } from "react";
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
    <div className="container max-w-md py-10">
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="current-password"
            required
          />
        </div>
        {formError ? (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        ) : null}
        <button disabled={loading} className="w-full rounded-lg bg-[color:var(--color-brand-4)] py-3 text-white disabled:opacity-60">
          {loading ? "Connexion..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-xs text-neutral-600">
        Tip: Use emails like admin@example.com or seller@example.com to see role-based nav.
      </p>
    </div>
  );
}
