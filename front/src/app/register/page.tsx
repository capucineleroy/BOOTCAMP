import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50 lg:flex-row">
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 text-neutral-900 shadow-lg sm:px-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <span className="text-sm uppercase tracking-[0.3em] text-[color:var(--color-brand-4)]">Nouvel espace</span>
            <h1 className="mt-3 text-3xl font-semibold text-neutral-900">Creer un compte</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Renseignez vos informations pour acceder a vos achats responsables, suivre vos retours et recevoir nos actualites.
            </p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-sm text-neutral-500">
            Deja inscrit ?
            <Link href="/login" className="ml-2 font-semibold text-[color:var(--color-brand-4)] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden flex-1 items-stretch justify-center overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f1fff] via-[#6320ee] to-[#14192d]" />
        <div className="absolute -right-32 top-3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-4rem] h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-16 text-white">
          <div>
            <h2 className="text-3xl font-semibold">Rejoignez la communaute</h2>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Centralisez vos informations et suivez l'impact carbone de chaque commande pour faire les bons choix.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Mode durable</p>
        </div>
      </div>
    </div>
  );
}
