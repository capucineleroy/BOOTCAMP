export default function Footer() {
  return (
    <footer className="bg-[#015A52]/75 ">
      <div className="container py-8 grid gap-6 sm:grid-cols-3 text-sm text-white">
        <div>
          <h4 className="text-white font-semibold mb-2">À propos</h4>
          <p className="leading-relaxed">Minimalist sneakers designed in Europe with a focus on sustainability and timeless style.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Suivez nous</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Instagram</a></li>
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">Facebook</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Mentions légales</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Mentions légales</a></li>
            <li><a href="#" className="hover:underline">Politique de confidentialité (RGPD)</a></li>
            <li><a href="#" className="hover:underline">Conditions d’utilisation</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-white">© {new Date().getFullYear()} SNECO — All rights reserved.</div>
    </footer>
  );
}

