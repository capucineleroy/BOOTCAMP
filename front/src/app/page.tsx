import Link from "next/link";
import { LeafIcon, HeartIcon, AwardIcon } from "../components/icons";

const bestSellers = [
  {
    id: "urban-runner",
    name: "Urban Runner Pro",
    price: 129,
    image: "/chaussure.jpg",
    tag: "New",
  },
  {
    id: "street-style",
    name: "Street Style Elite",
    price: 149,
    image: "/adidas.avif",
    tag: "New",
  },
  {
    id: "comfort-classic",
    name: "Comfort Classic",
    price: 99,
    image: "/placeholder.png",
    tag: "New",
  },
  {
    id: "performance-max",
    name: "Performance Max",
    price: 179,
    image: "/placeholder.svg",
    tag: "New",
    highlight: true,
  },
];

const valueHighlights = [
  {
    title: "Eco-Friendly",
    icon: LeafIcon,
    background: "bg-[#DFF3E5]",
    iconColor: "text-[#167D5D]",
  },
  {
    title: "Ethically Made",
    icon: HeartIcon,
    background: "bg-[#FDECEE]",
    iconColor: "text-[#F26C5E]",
  },
  {
    title: "Award Winning",
    icon: AwardIcon,
    background: "bg-[#FDF1E6]",
    iconColor: "text-[#F28B44]",
  },
];

const impactStats = [
  { value: "100%", label: "Recycled Materials", tone: "bg-[#E8F5F3]" },
  { value: "50+", label: "Countries", tone: "bg-[#FCEFE8]" },
  { value: "5M+", label: "Steps Taken", tone: "bg-[#E8F1FC]" },
  { value: "0", label: "Carbon Footprint", tone: "bg-[#F1F2F4]" },
];

export default function Home() {
  return (
    <section>
      {/* Hero section */}
      <div className="relative bg-[#F8F8F8]">
        <div className="container grid md:grid-cols-2 items-center gap-10 py-16">
          <div>
            <div className="inline-block rounded-full px-3 py-1 text-xs bg-[#FE8B59]/15 text-[#f05817]">Premium / Minimal / Sustainable</div>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Notre collection &eacute;t&eacute; 2025</h1>
            <p className="mt-4 text-neutral-600">Fabriqu&eacute;es &agrave; partir de mat&eacute;riaux recycl&eacute;s, con&ccedil;ues pour le confort. D&eacute;couvrez nos nouveaux mod&egrave;les.</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/shop" className="px-5 py-3 rounded-lg bg-[#015A52] text-white hover:opacity-95">D&eacute;couvrir</Link>
              <Link href="/new" className="px-5 py-3 rounded-lg border border-[#015A52] border-2 hover:bg-neutral-50">Nouveaut&eacute;s</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bg.jpeg" alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 " />
          </div>
        </div>
      </div>

      {/* Best sellers */}
      <div className="bg-white">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Best Sellers</h2>
            <p className="mt-3 text-neutral-600">Join thousands of satisfied customers with our top rated sneakers.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 md:gap-4 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="relative flex-1 p-2">
                  {product.tag ? (
                    <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-[#FE8B59] px-3 py-1 text-xs font-medium text-white">
                      {product.tag}
                    </span>
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`mx-auto h-40 w-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                      product.highlight ? "opacity-90" : ""
                    }`}
                  />
                  {product.highlight ? (
                    <button className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#015A52] px-4 py-2 text-sm font-medium text-white shadow-lg">
                      <span className="text-lg leading-none">+</span> Quick Add
                    </button>
                  ) : null}
                </div>
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-normal text-neutral-900 text-center">{product.name}</h3>
                  <p className="mt-2 text-xl font-medium text-[#015A52] text-center">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company values */}
      <div className="bg-[#F8F8F8]">
        <div className="container py-20">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-[#015A52]/10 px-3 py-1 text-xs font-medium text-[#015A52]">About Sneaco</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
                Crafted for the Conscious Runner
              </h2>
              <p className="mt-6 text-neutral-600">
                At SNEACO we believe that premium performance should never come at the cost of our planet. Every pair is built with
                sustainable materials and ethical manufacturing practices.
              </p>
              <p className="mt-4 text-neutral-600">
                Our mission is to empower athletes while protecting the environment for future generations. Join us in stepping toward a more sustainable future.
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







