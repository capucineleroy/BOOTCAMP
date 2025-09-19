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
  // price représentatif (ex: prix min des variants)
  price: number;
  co2: number; // in kg CO2e
  color: string; // couleur par défaut pour affichage
  colors?: string[];
  gender: 'M' | 'F' | 'U';
  sizes: ProductVariant[]; // liste de variants simplifiée
  images: string[]; // public URLs
  brand: string;
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
