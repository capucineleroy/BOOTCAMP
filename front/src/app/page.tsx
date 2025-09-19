import Link from "next/link";
import { LeafIcon, HeartIcon, AwardIcon } from "../components/icons";
import { supabase } from "../lib/supabaseClient";
import { fetchProducts } from "../lib/supabaseApi";
import HomeTopCard from "../components/HomeTopCard";

// Server-side: fetch products that have the lowest total stock available across their variants.
// Server-side: fetch the full product list and pick the 4 most expensive products
async function fetchTopProducts(limit = 4) {
  const all = await fetchProducts();
  if (!all || !all.length) return [];
  const sorted = all.slice().sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  return sorted.slice(0, limit);
}

const valueHighlights = [
  {
    title: "Éco-responsable",
    icon: LeafIcon,
    background: "bg-[#DFF3E5]",
    iconColor: "text-[#167D5D]",
  },
  {
    title: "Fabrication éthique",
    icon: HeartIcon,
    background: "bg-[#FDECEE]",
    iconColor: "text-[#F26C5E]",
  },
  {
    title: "Récompensé",
    icon: AwardIcon,
    background: "bg-[#FDF1E6]",
    iconColor: "text-[#F28B44]",
  },
];

const impactStats = [
  { value: "100%", label: "Matériaux recyclés", tone: "bg-[#E8F5F3]" },
  { value: "50+", label: "Pays", tone: "bg-[#FCEFE8]" },
  { value: "5M+", label: "Réparations faites", tone: "bg-[#E8F1FC]" },
  { value: "0", label: "Empreinte carbone", tone: "bg-[#F1F2F4]" },
];

export default async function Home() {
  const list = (await fetchTopProducts()) ?? [];

  return (
    <section>
  {/* Section Héro */}
      <div className="relative bg-[#F8F8F8] flex items-center min-h-[520px]">
        <div className="container grid md:grid-cols-2 items-center gap-10 py-16">
          <div>
            <div className="inline-block rounded-full px-3 py-1 text-xs bg-[#FE8B59]/15 text-[#f05817]">Premium / Minimaliste / Durable</div>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Notre collection &eacute;t&eacute; 2025</h1>
            <p className="mt-4 text-neutral-600">Sneakers neuves, expertise restauration. Confiance garantie.</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/shop" className="px-5 py-3 rounded-lg bg-[#015A52] text-white hover:opacity-95">D&eacute;couvrir</Link>
              <Link href="/new" className="px-5 py-3 rounded-lg border border-[#015A52] border-2 hover:bg-neutral-50">Nouveaut&eacute;s</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chasssure orange et vert.jpeg" alt="Image d'illustration" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 " />
          </div>
        </div>
      </div>

          {/* Catalogues (Homme / Femme / Enfant) */}
          <div className="bg-white flex items-center min-h-[520px]">
            <div className="container py-16">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Catalogues</h2>
                <p className="mt-3 text-neutral-600">Explorez nos catalogues selon les genres</p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="/shop?gender=male" className="group block overflow-hidden rounded-lg border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/modele homme.jpeg" alt="Catalogue Homme" className="w-full h-48 object-cover object-[0_10%] group-hover:scale-105 transition-transform" />
                  <div className="p-4 text-center">
                    <h3 className="font-semibold">Homme</h3>
                    <p className="text-sm text-neutral-600">Voir la sélection Homme</p>
                  </div>
                </a>

                <a href="/shop?gender=female" className="group block overflow-hidden rounded-lg border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/modèle femme.jpeg" alt="Catalogue Femme" className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform" />
                  <div className="p-4 text-center">
                    <h3 className="font-semibold">Femme</h3>
                    <p className="text-sm text-neutral-600">Voir la sélection Femme</p>
                  </div>
                </a>

                <a href="/shop?gender=kids" className="group block overflow-hidden rounded-lg border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/modele enfant.jpeg" alt="Catalogue Enfant" className="w-full h-48 object-cover object-[0_10%] group-hover:scale-105 transition-transform" />
                  <div className="p-4 text-center">
                    <h3 className="font-semibold">Enfant</h3>
                    <p className="text-sm text-neutral-600">Voir la sélection Enfant</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

  {/* Meilleures ventes */}
  <div className="bg-[#F8F8F8] flex items-center min-h-[520px]">
    <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Meilleures ventes</h2>
            <p className="mt-3 text-neutral-600">Rejoignez des milliers de clients satisfaits grâce à nos baskets les mieux notées.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 md:gap-4 lg:grid-cols-4">
            {list.map((product: any) => (
              <HomeTopCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

  {/* Company values */}
  <div className="bg-white flex items-center min-h-[520px]">
    <div className="container py-20">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-[#015A52]/10 px-3 py-1 text-xs font-medium text-[#015A52]">À propos de Sneco</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
                Conçues pour le coureur responsable
              </h2>
              <p className="mt-6 text-neutral-600">
                Chez SNECO, nous pensons que la performance premium ne doit jamais se faire au détriment de la planète. Chaque paire est fabriquée
                avec des mat&eacute;riaux durables et selon des pratiques de production &eacute;thiques.
              </p>
              <p className="mt-4 text-neutral-600">
                Notre mission est d'accompagner les sportifs tout en pr&eacute;servant l'environnement pour les g&eacute;n&eacute;rations futures. Rejoignez-nous pour avancer vers un avenir plus durable.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                {valueHighlights.map(({ title, icon: Icon, background, iconColor }) => (
                  <div key={title} className="flex flex-col items-center text-center">
                    <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${background}`}>
                      <Icon className={`h-7 w-7 ${iconColor}`} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2">
              {impactStats.map((stat) => (
                <div key={stat.label} className={`rounded-3xl p-6 text-center ${stat.tone}`}>
                  <div className="text-4xl font-semibold text-[#015A52]">{stat.value}</div>
                  <p className="mt-2 text-sm font-medium text-neutral-700">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}







