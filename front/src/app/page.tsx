import Link from 'next/link';

export default function Home() {
  return (
    <section>
      <div className="relative">
        <div className="container grid md:grid-cols-2 items-center gap-10 py-16">
          <div>
            <div className="inline-block rounded-full px-3 py-1 text-xs bg-[color:var(--color-brand-1)]/50 text-[color:var(--color-brand-4)]">Premium • Minimal • Sustainable</div>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Timeless sneakers for modern living</h1>
            <p className="mt-4 text-neutral-600">Crafted with recycled materials, designed for comfort. Meet our latest minimalist silhouettes in fresh seasonal tones.</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/shop" className="px-5 py-3 rounded-lg bg-[#014545] text-white hover:opacity-95">Explore E-shop</Link>
              <Link href="/new" className="px-5 py-3 rounded-lg border border-[#014545] border-2 hover:bg-neutral-50">New Arrivals</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/placeholder.svg" alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/40" />
          </div>
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

