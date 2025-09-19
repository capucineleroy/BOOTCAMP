import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="container grid gap-6 py-8 text-sm text-neutral-800 sm:grid-cols-3">
        <div>
          <h4 className="mb-2 font-semibold text-neutral-950">A propos</h4>
          <p className="leading-relaxed">
            Nous créons des sneakers minimalistes en Europe, avec un engagement fort pour la durabilité et un design qui traverse le temps.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-neutral-950">Suivez nous</h4>
          <ul className="space-y-1">
            <li>
              <a href="#" className="text-[#018D5B] transition-colors hover:text-[#02a56d]">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="text-[#018D5B] transition-colors hover:text-[#02a56d]">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="text-[#018D5B] transition-colors hover:text-[#02a56d]">
                Facebook
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-neutral-950">Mentions légales</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/mentions-legales" className="text-[#018D5B] transition-colors hover:text-[#02a56d]">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/politique-de-confidentialite" className="text-[#018D5B] transition-colors hover:text-[#02a56d]">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href="/conditions-de-vente" className="text-[#018D5B] transition-colors hover:text-[#02a56d]">
                Conditions de vente
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-neutral-500">
        (c) {new Date().getFullYear()} SNECO - All rights reserved.
      </div>
    </footer>
  );
}
