const SECTIONS = [
  {
    title: "1. Objet",
    body: [
      "Les presentes conditions generales de vente regissent les relations contractuelles entre Sneco et toute personne effectuant un achat via la plateforme en ligne.",
    ],
  },
  {
    title: "2. Produits et services",
    body: [
      "Sneco propose a la vente des sneakers et chaussures neuves, ainsi qu'un service de reparation et de recyclage solidaire.",
    ],
  },
  {
    title: "3. Prix",
    body: [
      "Les prix sont indiques en euros, toutes taxes comprises (TTC). Sneco se reserve le droit de modifier ses prix a tout moment, les produits etant factures sur la base en vigueur au moment de la commande.",
    ],
  },
  {
    title: "4. Commandes et creation de compte",
    body: [
      "L'achat sur le site necessite la creation d'un compte client avec les informations suivantes : nom, prenom, adresse email et mot de passe.",
      "Le client est responsable de la confidentialite de ses identifiants.",
    ],
  },
  {
    title: "5. Paiement",
    body: ["Les paiements sont securises et realises via le prestataire Stripe. Les cartes bancaires sont acceptees."],
  },
  {
    title: "6. Livraison",
    body: [
      "Les livraisons sont assurees par des prestataires externes. Les delais et frais de livraison sont communiques lors de la commande.",
    ],
  },
  {
    title: "7. Droit de retractation",
    body: [
      "Conformement a la loi, le client dispose d'un delai de 14 jours a compter de la reception de sa commande pour exercer son droit de retractation.",
      "Les frais de retour sont a la charge du client.",
    ],
  },
  {
    title: "8. Retour et remboursement",
    body: [
      "Les produits doivent etre retournes dans leur etat d'origine. Apres reception et verification, le remboursement sera effectue via le meme moyen de paiement que celui utilise lors de la commande.",
    ],
  },
  {
    title: "9. Service client",
    body: ["Pour toute question ou reclamation, le client peut contacter Sneco par email a sneco@gmail.com."],
  },
];

export default function ConditionsDeVentePage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#014545]">Conditions generales de vente</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">Conditions de vente</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Ces conditions definissent le cadre contractuel applicable a toute commande passee sur la plateforme Sneco.
          </p>
        </header>

        <div className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-neutral-900">{section.title}</h2>
              <div className="space-y-2 text-sm leading-relaxed text-neutral-700">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.title}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
