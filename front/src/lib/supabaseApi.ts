import { supabase } from './supabaseClient';
import type { Product, ProductVariant, CartItem } from './types';

// Map DB product + variants + images to front Product type
function mapProductRow(productRow: any, variants: any[], images: any[]): Product {
  const sizes: ProductVariant[] = variants.map((v) => ({ size: Number(v.size), stock: Number(v.stock) }));
  const imgs = images.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((i) => i.url);
  return {
    id: productRow.id,
    name: productRow.title,
    description: productRow.description ?? '',
    price: Number(variants[0]?.price ?? 0),
    co2: 0,
    color: variants[0]?.color ?? 'unknown',
    gender: 'U',
    sizes,
    images: imgs.length ? imgs : ['/adidas.avif'],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data: productsRows, error } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)');
  if (error) throw error;
  return (productsRows ?? []).map((p: any) => mapProductRow(p, p.product_variants ?? [], p.product_images ?? []));
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data: productsRows, error } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('id', id)
    .limit(1)
    .single();
  if (error) {
    if ((error as any).code === 'PGRST116') return null; // row not found
    throw error;
  }
  return mapProductRow(productsRows, productsRows.product_variants ?? [], productsRows.product_images ?? []);
}

// Cart helpers: assumes a cart row exists for anonymous users; returns cart id
export async function createCart(userId?: string): Promise<string> {
  const payload: any = {};
  if (userId) payload.user_id = userId;
  const { data, error } = await supabase.from('carts').insert(payload).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product_variants(*)')
    .eq('cart_id', cartId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ productId: row.product_variants.product_id, size: Number(row.product_variants.size), quantity: Number(row.quantity) }));
}

export async function addCartItem(cartId: string, variantId: string, quantity = 1) {
  const { data, error } = await supabase.from('cart_items').insert({ cart_id: cartId, variant_id: variantId, quantity }).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const { data, error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId).select('*').single();
  if (error) throw error;
  return data;
}

export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
  if (error) throw error;
  return true;
}
