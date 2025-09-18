"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  consent?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: FieldErrors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      errors.firstName = "Veuillez saisir votre prenom.";
    }

    if (!trimmedLastName) {
      errors.lastName = "Veuillez saisir votre nom.";
    }

    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      errors.email = "Veuillez saisir une adresse email valide.";
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caracteres.`;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    if (!consent) {
      errors.consent = "Vous devez accepter nos conditions d'utilisation.";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await signup(firstName.trim(), lastName.trim(), email.trim(), password);
      setSuccessMessage("Demande envoyee. Verifiez votre email pour confirmer votre inscription.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setConsent(false);
      setFieldErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue pendant l'inscription.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const baseInputClasses = "mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm transition focus:border-[#018D5B] focus:outline-none focus:ring-2 focus:ring-[#30c890]/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="text-sm font-medium text-neutral-700">
            Prenom
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={baseInputClasses}
            aria-invalid={Boolean(fieldErrors.firstName)}
            aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
            autoComplete="given-name"
            required
          />
          {fieldErrors.firstName ? (
            <p id="firstName-error" className="mt-2 text-sm text-red-600">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="lastName" className="text-sm font-medium text-neutral-700">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={baseInputClasses}
            aria-invalid={Boolean(fieldErrors.lastName)}
            aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
            autoComplete="family-name"
            required
          />
          {fieldErrors.lastName ? (
            <p id="lastName-error" className="mt-2 text-sm text-red-600">
              {fieldErrors.lastName}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={baseInputClasses}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          autoComplete="email"
          required
        />
        {fieldErrors.email ? (
          <p id="email-error" className="mt-2 text-sm text-red-600">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={baseInputClasses}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            autoComplete="new-password"
            required
          />
          {fieldErrors.password ? (
            <p id="password-error" className="mt-2 text-sm text-red-600">
              {fieldErrors.password}
            </p>
          ) : null}
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
            className={baseInputClasses}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
            autoComplete="new-password"
            required
          />
          {fieldErrors.confirmPassword ? (
            <p id="confirmPassword-error" className="mt-2 text-sm text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border border-neutral-300 text-[#018D5B] focus:ring-[#02a56d]"
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={fieldErrors.consent ? "consent-error" : undefined}
            required
          />
          <span>
            J'accepte les CGU, la politique de confidentialite et autorise la collecte de mes donnees pour la gestion de mon compte.
          </span>
        </label>
        {fieldErrors.consent ? (
          <p id="consent-error" className="mt-2 text-sm text-red-600">
            {fieldErrors.consent}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      {successMessage ? (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          {successMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#018D5B] py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#02a56d] focus:outline-none focus:ring-2 focus:ring-[#49d9ab]/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}

export default RegisterForm;
