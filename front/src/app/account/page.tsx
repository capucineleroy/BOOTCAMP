"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Role } from "@/lib/types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password: string;
};

const parseRole = (value: unknown): Role | null => {
  return value === "client" || value === "seller" || value === "admin" || value === "guest" ? value : null;
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    role: "client",
    password: "",
  });
  const [initialEmail, setInitialEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.auth.getUser();
      if (!active) return;

      if (fetchError) {
        console.error("Failed to fetch user profile", fetchError);
        setError("Impossible de charger votre profil. Veuillez reessayer.");
        setLoading(false);
        setIsAuthenticated(null);
        return;
      }

      const authUser = data.user;
      if (!authUser) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const metadata = authUser.user_metadata ?? {};
      const firstName = typeof metadata.firstName === "string" ? metadata.firstName : "";
      const lastName = typeof metadata.lastName === "string" ? metadata.lastName : "";
      const role = parseRole(metadata.role) ?? user?.role ?? "client";

      setForm({
        firstName,
        lastName,
        email: authUser.email ?? "",
        role,
        password: "",
      });
      setInitialEmail(authUser.email ?? "");
      setLoading(false);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const displayName = useMemo(() => {
    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    if (!trimmedFirst && !trimmedLast && form.email) {
      return form.email.split("@")[0];
    }
    return [trimmedFirst, trimmedLast].filter(Boolean).join(" ");
  }, [form.firstName, form.lastName, form.email]);

  const handleChange = (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    const confirmed = window.confirm("Etes-vous certain de vouloir supprimer definitivement votre compte ? Cette action est irreversible.");
    if (!confirmed) return;

    setDeletingAccount(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Failed to retrieve session before account deletion", sessionError);
      setDeleteError("Impossible de verifier votre session. Veuillez reessayer.");
      setDeletingAccount(false);
      return;
    }

    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setDeleteError("Impossible de verifier votre session. Veuillez vous reconnecter.");
      setDeletingAccount(false);
      return;
    }

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        let message = "Impossible de supprimer votre compte. Veuillez reessayer.";
        try {
          const body = await response.json();
          if (body?.error && typeof body.error === "string") {
            message = body.error;
          }
        } catch {
          // Ignored
        }
        setDeleteError(message);
        setDeletingAccount(false);
        return;
      }
    } catch (deleteError) {
      console.error("Failed to delete account", deleteError);
      setDeleteError("Une erreur inattendue s'est produite. Veuillez reessayer.");
      setDeletingAccount(false);
      return;
    }

    try {
      await logout();
    } catch (signOutError) {
      console.error("Failed to sign out after account deletion", signOutError);
      await supabase.auth.signOut().catch(() => undefined);
    }

    window.location.href = "/";
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    const trimmedEmail = form.email.trim();
    const fallbackName = displayName || (trimmedEmail ? (trimmedEmail.includes("@") ? trimmedEmail.split("@")[0] : trimmedEmail) : "Utilisateur");
    const payload: Parameters<typeof supabase.auth.updateUser>[0] = {
      data: {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        name: fallbackName,
        role: form.role,
      },
    };

    if (trimmedEmail && trimmedEmail !== initialEmail) {
      payload.email = trimmedEmail;
    }

    if (form.password) {
      payload.password = form.password;
    }

    const { error: updateError } = await supabase.auth.updateUser(payload);

    if (updateError) {
      console.error("Failed to update profile", updateError);
      setError(updateError.message ?? "Votre profil n'a pas pu etre mis a jour.");
      setSaving(false);
      return;
    }

    const { data: refreshed, error: refreshError } = await supabase.auth.getUser();

    if (refreshError) {
      console.error("Unable to refresh user after update", refreshError);
      setError("Profil mis a jour mais la vue n'a pas pu etre rafraichie.");
    } else if (refreshed.user) {
      const metadata = refreshed.user.user_metadata ?? {};
      setForm({
        firstName: typeof metadata.firstName === "string" ? metadata.firstName : "",
        lastName: typeof metadata.lastName === "string" ? metadata.lastName : "",
        email: refreshed.user.email ?? trimmedEmail,
        role: parseRole(metadata.role) ?? form.role,
        password: "",
      });
      setInitialEmail(refreshed.user.email ?? trimmedEmail);
      setSuccess("Profil mis a jour avec succes.");
    } else {
      setSuccess("Profil mis a jour avec succes.");
      setForm((prev) => ({ ...prev, password: "" }));
    }

    setSaving(false);
  };

  if (isAuthenticated === false) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">Connexion requise</h1>
          <p className="mt-3 text-sm text-neutral-500">
            Vous devez etre connecte pour acceder a votre compte.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Aller a la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-500">Mon espace</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-900">Informations du compte</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            Consultez et mettez a jour vos informations personnelles associees a votre compte Sneco.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount || loading}
            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingAccount ? "Suppression..." : "Supprimer mon compte"}
          </button>
          {deleteError ? (
            <p className="max-w-xs text-xs text-red-600">{deleteError}</p>
          ) : null}
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Mon profil</h2>
              <p className="mt-1 text-sm text-neutral-500">Modifiez vos informations personnelles et vos identifiants.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {form.role || user.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-neutral-700">
                  Prenom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  type="text"
                  placeholder="Votre prenom"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-neutral-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  type="text"
                  placeholder="Votre nom"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  disabled={loading || saving}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange("email")}
                type="email"
                placeholder="vous@example.com"
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                disabled={loading || saving}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange("password")}
                type="password"
                placeholder="Laissez vide pour conserver l'actuel"
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                disabled={loading || saving}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-400">
                Le nouveau mot de passe doit comporter au moins 6 caracteres.
              </div>
              <button
                type="submit"
                disabled={loading || saving}
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
                {success}
              </p>
            ) : null}
          </form>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">Etat du profil</h3>
            <p className="mt-2 text-sm text-neutral-500">
              {loading
                ? "Chargement de vos informations..."
                : "Vos informations personnelles sont stockees de maniere securisee via Supabase."}
            </p>
            <dl className="mt-6 space-y-3 text-sm text-neutral-600">
              <div className="flex justify-between">
                <dt className="font-medium text-neutral-500">Nom complet</dt>
                <dd className="text-neutral-900">{displayName || "Non renseigne"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-neutral-500">Email</dt>
                <dd className="text-neutral-900">{form.email || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-neutral-500">Role</dt>
                <dd className="text-neutral-900 capitalize">{(form.role || user?.role || "client").toLowerCase()}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">Support</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Besoin d'aide pour modifier vos informations ? Contactez notre equipe support pour etre accompagne.
            </p>
            <Link
              href="mailto:support@sneco.demo"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              Contacter le support
            </Link>
          </div>
        </aside>
      </section>

      {loading ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-400">
          Chargement de vos informations...
        </div>
      ) : null}
    </div>
  );
}






