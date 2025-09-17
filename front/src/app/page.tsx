import Link from 'next/link';

export default function Home() {
  return (
    <section>

      /* Hero section */ 
      <div className="relative bg-[#F8F8F8]">
        <div className="container grid md:grid-cols-2 items-center gap-10 py-16">
          <div>
            <div className="inline-block rounded-full px-3 py-1 text-xs bg-[#FE8B59]/20 text-[#FE8B59]">Premium • Minimal • Sustainable</div>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Notre collection été 2025</h1>
            <p className="mt-4 text-neutral-600">Fabriqués à partir de matériaux recyclés, conçus pour le confort. Découvrez nos nouveaux modèles.</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/shop" className="px-5 py-3 rounded-lg bg-[#015A52] text-white hover:opacity-95">Découvrir</Link>
              <Link href="/new" className="px-5 py-3 rounded-lg border border-[#015A52] border-2 hover:bg-neutral-50">Nouveautés</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bg.jpeg" alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 " />
          </div>
        </div>
      </div>

      {/*Nos produits*/}
      <div className='relative bg-white gap-10'>
        <div className=''>
          <h1 className='mt-4 text-4xl md:text-5xl font-semibold tracking-tight'>Nos iconiques</h1>
          <p className='mt-4 text-neutral-600'>Découvrez nos baskets durables les plus populaires, conçues pour allier performance et style.</p>
        </div>

        <div>

        </div>
      </div>





      <div className="container grid sm:grid-cols-3 gap-6 py-10">
        {["Recycled Materials", "Cloud Comfort", "Lightweight & Durable"].map((t) => (
          <div key={t} className="rounded-xl border p-5 bg-white">
            <h3 className="font-medium">{t}</h3>
            <p className="text-sm text-neutral-600 mt-1">Thoughtfully engineered for everyday performance.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

