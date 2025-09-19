import Image from "next/image";
import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
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
        <div className="w-full max-w-xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Retour à l'accueil
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-900">Creer un compte</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Renseignez vos informations pour accéder à vos achats responsables, suivre vos retours et recevoir nos actualités.
            </p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-sm text-neutral-500">
            Déjà inscrit ?
            <Link href="/login" className="ml-2 font-semibold text-[#018D5B] hover:text-[#02a56d]">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
