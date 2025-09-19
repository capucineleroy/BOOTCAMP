const SECTIONS = [
  {
    title: "1. Donnees collectees",
    body: [
      "Sneco collecte les informations necessaires a la creation d'un compte client et a la realisation des commandes : nom, prenom, adresse email, mot de passe.",
    ],
  },
  {
    title: "2. Finalite des traitements",
    body: [
      "Les donnees collectees sont utilisees pour gerer les commandes et les livraisons, gerer les comptes clients, communiquer avec les utilisateurs concernant leur commande et securiser les paiements.",
    ],
  },
  {
    title: "3. Partage des donnees",
    body: [
      "Les donnees personnelles ne sont jamais revendues a des tiers. Elles sont uniquement partagees avec le prestataire de paiement Stripe et les prestataires de livraison dans le cadre de l'execution du service.",
    ],
  },
  {
    title: "4. Duree de conservation",
    body: [
      "Les donnees sont conservees tant que le compte client est actif. L'utilisateur peut demander la suppression de son compte et de ses donnees par simple email a sneco@gmail.com.",
    ],
  },
  {
    title: "5. Securite",
    body: [
      "Sneco met en place des mesures techniques et organisationnelles pour proteger les donnees contre toute perte, utilisation abusive ou acces non autorise.",
    ],
  },
  {
    title: "6. Droits des utilisateurs",
    body: [
      "Conformement au RGPD, chaque utilisateur dispose d'un droit d'acces, de rectification, d'opposition et de suppression de ses donnees.",
      "Pour exercer ces droits, il suffit d'envoyer une demande a sneco@gmail.com.",
    ],
  },
];

export default function PolitiqueDeConfidentialitePage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#014545]">Protection des donnees</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">Politique de confidentialite</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Cette politique detaille la facon dont Sneco collecte, utilise et protege vos donnees personnelles.
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
