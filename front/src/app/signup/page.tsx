"use client";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);
      setSuccessMessage("Compte cree. Verifiez votre email pour confirmer l'inscription.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de creer le compte.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      <h1 className="mb-4 text-2xl font-semibold">Create account</h1>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="text-sm">
            Name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="name"
            required
          />
        </div>
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
            Password
          </label>
          <input
            id="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="new-password"
            required
          />
        </div>
        {formError ? (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p role="status" className="text-sm text-green-600">
            {successMessage}
          </p>
        ) : null}
        <button disabled={loading} className="w-full rounded-lg bg-[color:var(--color-brand-4)] py-3 text-white disabled:opacity-60">
          {loading ? "Inscription..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
