export type Role = 'guest' | 'client' | 'seller' | 'admin';

export interface ProductVariant {
  id: string; // product_variants.id
  size: string; // DB: text
  color: string; // DB: text
  price: number; // DB: numeric
  stock: number; // DB: integer
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number; // representative price (eg min variant price)
  co2: number; // in kg CO2e
  color: string; // default display colour
  colors?: string[];
  category: 'Homme' | 'Femme' | 'Unisexe';
  sizes: ProductVariant[]; // simplified variant list
  images: string[]; // public URLs
}

export interface CartItem {
  variantId: string; // product_variants.id
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
