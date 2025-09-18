import type { Product, ProductVariant } from './types';

// Basic placeholder image paths available in /public
const PLACEHOLDER = '/adidas.avif';

const colors = [
  '#FEB9B1', // blush
  '#FE8B59', // coral
  '#015A52', // green
  '#014545', // deep teal
  '#111111',
  '#888888',
];

const names = [
  'Aero Runner', 'City Flex', 'Prime Street', 'Nimbus Glide', 'Pulse Core',
  'Urban Drift', 'Trail Edge', 'Wave Rider', 'Vibe Motion', 'Volt Sprint',
];

function random<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function genSizes(productId: string, price: number): ProductVariant[] {
  const base = [38, 39, 40, 41, 42, 43, 44, 45];
  return base.map((s, idx) => ({
    id: `${productId}-v-${idx + 1}`,
    size: String(s),
    color: '',
    price,
    stock: Math.floor(Math.random() * 10),
  }));
}

export const products: Product[] = Array.from({ length: 100 }).map((_, i) => {
  const name = `${random(names)} ${i + 1}`;
  const color = random(colors);
  const price = 89 + Math.floor(Math.random() * 61); // 89-150€
  const co2 = parseFloat((3 + Math.random() * 6).toFixed(1)); // 3-9 kg
  const genderPool: Product['gender'][] = ['M', 'F', 'U'];
  const gender = random(genderPool);
  return {
    id: `p-${i + 1}`,
    name,
    description: 'Minimalist premium sneaker with recycled materials and breathable mesh. Designed for everyday comfort and durability.',
    price,
    co2,
    color,
    colors: [color],
    gender,
    sizes: genSizes(`p-${i + 1}`, price),
    images: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    brand: 'Generic',
  } satisfies Product;
});

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
