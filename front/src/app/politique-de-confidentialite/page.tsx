const SECTIONS = [
  {
    title: "1. données collectées",
    body: [
      "Sneco collecte les informations nécessaires à la création d'un compte client et à la réalisation des commandes : nom, prénom, adresse email, mot de passe.",
    ],
  },
  {
    title: "2. Finalité des traitements",
    body: [
      "Les données collectées sont utilisées pour gérer les commandes et les livraisons, gérer les comptes clients, communiquer avec les utilisateurs concernant leur commande et sécuriser les paiements.",
    ],
  },
  {
    title: "3. Partage des données",
    body: [
      "Les données personnelles ne sont jamais revendues à des tiers. Elles sont uniquement partagées avec le prestataire de paiement Stripe et les prestataires de livraison dans le cadre de l'exécution du service.",
    ],
  },
  {
    title: "4. Durée de conservation",
    body: [
      "Les données sont conservées tant que le compte client est actif. L'utilisateur peut demander la suppression de son compte et de ses données par simple email à sneco@gmail.com.",
    ],
  },
  {
    title: "5. Securite",
    body: [
      "Sneco met en place des mesures techniques et organisationnelles pour protéger les données contre toute perte, utilisation abusive ou accès non autorisé.",
    ],
  },
  {
    title: "6. Droits des utilisateurs",
    body: [
      "Conformement au RGPD, chaque utilisateur dispose d'un droit d'accès, de rectification, d'opposition et de suppression de ses données.",
      "Pour exercer ces droits, il suffit d'envoyer une demande à sneco@gmail.com.",
    ],
  },
];

export default function PolitiqueDeConfidentialitePage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#014545]">Protection des données</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">Politique de confidentialité</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Cette politique détaille la façon dont Sneco collecte, utilise et protège vos données personnelles.
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
