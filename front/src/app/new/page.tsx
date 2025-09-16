import ProductCard from "../../components/ProductCard";
import { products } from "../../lib/data";

export default function NewArrivalsPage() {
  const list = products.slice(-12);
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">New Arrivals</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

