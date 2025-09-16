export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="container py-8 grid gap-6 sm:grid-cols-3 text-sm text-neutral-600">
        <div>
          <h4 className="text-neutral-900 font-semibold mb-2">About</h4>
          <p className="leading-relaxed">Minimalist sneakers designed in Europe with a focus on sustainability and timeless style.</p>
        </div>
        <div>
          <h4 className="text-neutral-900 font-semibold mb-2">Follow</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Instagram</a></li>
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">Facebook</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-neutral-900 font-semibold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Mentions légales</a></li>
            <li><a href="#" className="hover:underline">Politique de confidentialité (RGPD)</a></li>
            <li><a href="#" className="hover:underline">Conditions d’utilisation</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-neutral-500">© {new Date().getFullYear()} SESSILE — All rights reserved.</div>
    </footer>
  );
}

