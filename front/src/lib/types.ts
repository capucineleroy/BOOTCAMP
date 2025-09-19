export type Role = 'guest' | 'client' | 'seller' | 'admin';

export interface ProductVariant {
  size: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number; // in EUR
  co2: number; // in kg CO2e
  color: string;
  gender: 'M' | 'F' | 'U';
  sizes: ProductVariant[];
  images: string[]; // public URLs
}

export interface CartItem {
  productId: string;
  size: number;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
