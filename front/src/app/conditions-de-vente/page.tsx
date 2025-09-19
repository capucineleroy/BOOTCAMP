const SECTIONS = [
  {
    title: "1. Objet",
    body: [
      "Les présentes conditions générales de vente régissent les relations contractuelles entre Sneco et toute personne effectuant un achat via la plateforme en ligne.",
    ],
  },
  {
    title: "2. Produits et services",
    body: [
      "Sneco propose à la vente des sneakers et chaussures neuves, ainsi qu'un service de réparation et de recyclage solidaire.",
    ],
  },
  {
    title: "3. Prix",
    body: [
      "Les prix sont indiqués en euros, toutes taxes comprises (TTC). Sneco se réserve le droit de modifier ses prix à tout moment, les produits étant facturés sur la base en vigueur au moment de la commande.",
    ],
  },
  {
    title: "4. Commandes et création de compte",
    body: [
      "L'achat sur le site nécessite la création d'un compte client avec les informations suivantes : nom, prénom, adresse email et mot de passe.",
      "Le client est responsable de la confidentialité de ses identifiants.",
    ],
  },
  {
    title: "5. Paiement",
    body: ["Les paiements sont securisés et réalisés via le prestataire Stripe. Les cartes bancaires sont acceptées."],
  },
  {
    title: "6. Livraison",
    body: [
      "Les livraisons sont assurées par des prestataires externes. Les délais et frais de livraison sont communiqués lors de la commande.",
    ],
  },
  {
    title: "7. Droit de rétractation",
    body: [
      "Conformement à la loi, le client dispose d'un délai de 14 jours à compter de la réception de sa commande pour exercer son droit de rétractation.",
      "Les frais de retour sont à la charge du client.",
    ],
  },
  {
    title: "8. Retour et remboursement",
    body: [
      "Les produits doivent être retournés dans leur état d'origine. Apres réception et vérification, le remboursement sera effectue via le même moyen de paiement que celui utilisé lors de la commande.",
    ],
  },
  {
    title: "9. Service client",
    body: ["Pour toute question ou réclamation, le client peut contacter Sneco par email à sneco@gmail.com."],
  },
];

export default function ConditionsDeVentePage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#014545]">Conditions générales de vente</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">Conditions de vente</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Ces conditions définissent le cadre contractuel applicable à toute commande passée sur la plateforme Sneco.
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
