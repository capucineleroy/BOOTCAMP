import Image from "next/image";
import Link from "next/link";
import { FaTools, FaRecycle, FaUsers, FaHammer, FaGift } from "react-icons/fa";

const VALUES = [
  {
    title: "Réparer plutôt que jeter",
    description:
      "Un service simple et accessible : envoyez une photo de vos sneakers, nous proposons la réparation adaptée. 60 % des bénéfices vont à nos associations partenaires.",
    icon: <FaTools className="h-10 w-10 text-[#014545]" />,
  },
  {
    title: "Donner une seconde vie",
    description:
      "Les paires irréparables sont reprises gratuitement, redistribuées via nos associations ou envoyées dans des filières de recyclage spécialisées.",
    icon: <FaRecycle className="h-10 w-10 text-[#014545]" />,
  },
  {
    title: "Apprendre à entretenir",
    description:
      "Avec nos kits de réparation DIY, chacun peut prolonger la vie de ses sneakers et devenir acteur d’une consommation plus responsable.",
    icon: <FaHammer className="h-10 w-10 text-[#014545]" />,
  },
  {
    title: "Récompenser l’engagement",
    description:
      "Un système de bons de réduction récompense les utilisateurs qui nous confient leurs paires usées, bouclant ainsi la boucle circulaire.",
    icon: <FaGift className="h-10 w-10 text-[#014545]" />,
  },
];


export default function BrandPage() {
  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-neutral-900">
        
        <div className="absolute inset-0 bg-[#014545]/80" />
        <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-6 px-6 py-20 text-white sm:px-10 lg:px-16">
          <span className="text-sm uppercase tracking-widest text-white/70">Notre projet</span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Des sneakers qui changent la façon de consommer.
          </h1>
          <p className="max-w-2xl text-lg text-white/80 sm:text-xl">
            Avec Sneco, chaque achat, chaque réparation et chaque don a du sens. Nous allions style, 
  durabilité et solidarité pour réinventer l’expérience de la sneaker et construire une mode plus responsable.
          </p>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#014545] transition hover:bg-white/90"
            >
              Decouvrir nos produits
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#014545]">Notre histoire</span>
            <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">De l’idée solidaire à une communauté engagée</h2>
            <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">
              Sneco est né d’un constat simple : nous possédons tous des sneakers que nous aimons, mais trop souvent elles finissent à la poubelle alors qu’elles pourraient être réparées, données ou recyclées. Depuis notre création, nous avons choisi d’agir autrement : proposer des sneakers neuves soigneusement sélectionnées, mais aussi offrir des solutions accessibles pour prolonger leur durée de vie.
            </p>
            <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">
              Grâce à notre plateforme en ligne, chacun peut faire réparer ses sneakers via un diagnostic photo, retourner gratuitement ses paires usées pour qu’elles soient données ou recyclées, ou encore apprendre à les entretenir avec nos kits DIY. Pour chaque réparation, 60 % des bénéfices sont reversés à des associations partenaires. Notre mission : montrer que consommer peut rimer avec agir.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-3xl bg-neutral-100 shadow-lg sm:h-96">
            <Image
              src="/design.png"
              alt="logo"
              fill
              className="h-full w-full object-cover"
              sizes="(min-width: 1024px) 480px, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#014545]">Nos valeurs</span>
            <h2 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">Ce qui guide Sneco au quotidien</h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">
              Chez Sneco, chaque paire raconte une histoire. Nous croyons qu’il est possible d’aimer la mode sans fermer les yeux sur son impact. Notre démarche repose sur trois piliers : prolonger la vie des sneakers pour réduire le gaspillage, reverser une partie des bénéfices pour soutenir des projets solidaires, et donner aux clients les outils pour devenir acteurs d’un changement durable. Nous voulons bâtir une communauté où chaque pas compte, pour soi et pour les autres.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {VALUES.map((value) => (
              <article key={value.title} className="flex h-full flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#014545]/10">
                  {value.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative h-72 overflow-hidden rounded-3xl bg-[#014545]/10 sm:h-96">
            <Image
              src="/chaussure restauré.jpeg"
              alt="Paysage naturel illustrant notre engagement eco-responsable"
              fill
              className="h-full w-full object-cover"
              sizes="(min-width: 1024px) 480px, 100vw"
            />
          </div>
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#014545]">Engagement eco-responsable</span>
            <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">Reduire, recycler, reparer</h2>
            <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">
               L’impact de Sneco se mesure dans les gestes du quotidien : réparer plutôt que jeter, recycler plutôt que polluer, donner plutôt qu’accumuler. Nos partenaires assurent une gestion responsable des paires usées, et notre compteur solidaire permet de suivre en temps réel les bénéfices reversés, les sneakers sauvées et les dons effectués. Ensemble, nous prouvons que chaque sneaker peut avoir plusieurs vies.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#014545] py-16">
        <div className="mx-auto max-w-4xl space-y-6 px-6 text-center text-white sm:px-10">
          <h2 className="text-3xl font-semibold sm:text-4xl">Pret a rejoindre l'aventure Sneco ?</h2>
          <p className="text-base leading-relaxed text-white/80 sm:text-lg">
            Explorez nos collections, découvrez notre service de réparation solidaire et participez à une aventure où vos sneakers prennent un sens nouveau. Chez Sneco, votre style peut aussi devenir un geste pour la planète et pour la société.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#014545] transition hover:bg-white/90"
          >
            Explorer la boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
