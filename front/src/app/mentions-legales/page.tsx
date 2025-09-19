import Link from "next/link";

const SECTIONS = [
  {
    title: "Editeur du site",
    body: [
      "Le present site est edite par la societe Sneco, SAS au capital de [a completer], dont le siege social est situe au 16 Rue Theodore Blanc, Bordeaux, France.",
      "Adresse email : sneco@gmail.com",
      "Telephone : 4242424242",
    ],
  },
  {
    title: "Directeur de publication",
    body: ["Albus Sneco"],
  },
  {
    title: "Hebergement du site",
    body: [
      "Le site est actuellement heberge sur les serveurs internes de la societe Sneco.",
      "Un hebergeur externe sera mentionne lorsque l'infrastructure sera externalisee.",
    ],
  },
  {
    title: "Propriete intellectuelle",
    body: [
      "L'ensemble du contenu du site (textes, visuels, logos, marques, etc.) est la propriete exclusive de Sneco.",
      "Toute reproduction, totale ou partielle, sans autorisation prealable est interdite.",
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#014545]">Informations legales</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">Mentions legales</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Consultez les informations obligatoires relatives a l'editeur du site, a son hebergement et a la propriete intellectuelle.
          </p>
        </header>

        <div className="space-y-10 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold text-neutral-900">{section.title}</h2>
              <div className="space-y-2 text-sm leading-relaxed text-neutral-700">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.title}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 flex flex-wrap gap-3 text-xs text-neutral-500">
          <Link href="/conditions-de-vente" className="underline underline-offset-2">
            Conditions de vente
          </Link>
          <span aria-hidden="true">?</span>
          <Link href="/politique-de-confidentialite" className="underline underline-offset-2">
            Politique de confidentialite
          </Link>
        </footer>
      </div>
    </div>
  );
}
