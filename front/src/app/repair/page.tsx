"use client";

import Image from "next/image";
import Link from "next/link";

const processSteps = [
  {
    title: "Choix depuis votre historique",
    description:
      "Sélectionnez la paire à réparer depuis vos commandes passées en quelques clics seulement.",
  },
  {
    title: "Upload de 6 photos detaillees",
    description:
      "Photographiez des vues avant, arrière et de profils de vos deux sneakers pour un diagnostic précis.",
  },
  {
    title: "Notation experte A -> E",
    description:
      "Nos artisans évaluent chaque zone pour identifier les retouches sur mesure et estimer la charge de travail.",
  },
  {
    title: "Devis detaillé par email",
    description:
      "Recevez un devis clair sous 48h avec les étapes de réparation et le délai confirmé.",
  },
  {
    title: "Réparation en 7 semaines",
    description:
      "Nous restaurons votre paire dans nos ateliers certifiés, puis nous vous la renvoyons soigneusement emballée.",
  },
] as const;

const faqs = [
  {
    question: "Quels dommages prenez-vous en charge ?",
    answer:
      "Nos ateliers traitent les déchirures, coutures, recolorations, nettoyage profond et semelles partiellement usées.",
  },
  {
    question: "Combien de temps dure une réparation ?",
    answer:
      "Le processus complet prend jusqu'à 7 semaines, transport inclus, avec un suivi par email à chaque étape.",
  },
  {
    question: "Le devis est-il payant ?",
    answer:
      "Non, le diagnostic et le devis sont gratuits. Vous decidez d'accepter ou non avant d'engager la réparation.",
  },
  {
    question: "Comment préparer mon colis ?",
    answer:
      "Nous vous envoyons un kit d'expédition prépayé et recyclé pour protéger vos sneakers pendant le transport.",
  },
] as const;

export default function RepairPage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6 lg:px-0">
        <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-xl">
          <div className="absolute inset-0">
            <Image
              src="/repair.jpeg"
              alt="Sneakers en cours de réparation"
              fill
              priority
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/70 via-neutral-900/60 to-[#014545]/80" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 px-6 py-16 sm:px-12">
            <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em]">
              Service réparation
            </span>
            <h1 className="text-4xl font-semibold sm:text-5xl">Redonnez vie à vos sneakers</h1>
            <p className="max-w-xl text-sm text-neutral-100 sm:text-base">
              Nos artisans specialisés restaurent vos paires iconiques avec des materiaux premium et un suivi serré du début à la fin.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#015A52] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#014545]/40 transition hover:bg-[#026b6b]"
              >
                Démarrer une réparation
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#015A52] shadow-lg transition hover:bg-neutral-100"
              >
                Explorer la boutique
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900">Notre processus</h2>
            <p className="text-sm text-neutral-600">
              Une expérience fluide pour remettre vos sneakers en état sans stress ni surprise.
            </p>
          </div>
          <ol className="space-y-4">
            {processSteps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg md:flex-row md:items-center"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#015A52] text-lg font-semibold text-white">
                  {index + 1}
                </div>
                <div className="md:pl-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-900">DIY Repair Kits</h2>
              <p className="text-sm text-neutral-600">
                Entretenez vos sneakers à la maison avec nos kits concus par les artisans Sneco.
              </p>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>- Nettoyant premium et microfibres anti-traces</li>
                <li>- Colle professionnelle et patchs de renfort</li>
                <li>- Guide vidéo pas-a-pas exclusif Sneco</li>
              </ul>
              <Link
                href="/product/repair-kit"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#015A52] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#014545]"
              >
                Acheter
              </Link>
            </div>
            <div className="flex h-full items-stretch">
              <div className="flex w-full flex-col justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#014545] via-[#026b6b] to-neutral-900 p-6 text-white shadow-inner">
                <div className="rounded-xl bg-white/10 p-4 text-sm backdrop-blur">
                  Astuce : combinez un kit DIY avec une reparation atelier pour prolonger la vie de vos sneakers préférées.
                </div>
                <div className="rounded-xl bg-white/10 p-4 text-sm backdrop-blur">
                  Accès à notre communauté privée et à des masterclass en ligne inclus avec chaque kit.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900">FAQ</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-neutral-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-[#014545] p-10 text-white shadow-xl">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">Prêt à reconditionner vos sneakers ?</h2>
              <p className="text-sm text-white/80">
                Un conseiller vous accompagne dès que vous lancez la demande pour assurer un suivi personnalisé.
              </p>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#014545] transition hover:bg-neutral-100"
            >
               Commandes
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
