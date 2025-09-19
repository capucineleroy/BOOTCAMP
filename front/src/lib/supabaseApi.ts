import { supabase } from './supabaseClient';
import type { Product, ProductVariant, CartItem } from './types';

// Map DB product + variants + images to front Product type
function mapProductRow(productRow: any, variants: any[], images: any[]): Product {
  const sizes: ProductVariant[] = variants.map((v) => ({
    id: v.id,
    size: String(v.size),
    color: String(v.color ?? ''),
    price: Number(v.price ?? 0),
    stock: Number(v.stock ?? 0),
  }));
  const imgs = images
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.url);
  const representativePrice = sizes.length ? Math.min(...sizes.map((s) => s.price)) : 0;
  const categoryRaw = String(productRow.category ?? '').trim().toLowerCase();
  let category: Product['category'] = 'Unisexe';
  if (categoryRaw.startsWith('hom')) category = 'Homme';
  else if (categoryRaw.startsWith('fem')) category = 'Femme';
  else if (categoryRaw.startsWith('uni')) category = 'Unisexe';

  return {
    id: productRow.id,
    name: productRow.title,
    brand: productRow.brand ?? 'Sneaco',
    description: productRow.description ?? '',
    price: representativePrice,
    co2: 0,
    color: sizes[0]?.color ?? 'unknown',
    colors: Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    category,
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
    .select('*')
    .eq('cart_id', cartId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ variantId: row.variant_id, quantity: Number(row.quantity) }));
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

// Simulated order creation: inserts into orders and order_items (best-effort). If Supabase is not configured
// or returns error, we return a generated id and simulate success so the front-end flow can continue.
export async function createOrder(userId: string | null, items: Array<{ variantId: string; quantity: number; price: number }>, totalAmount: number) {
  try {
    const payload: any = { user_id: userId, total_amount: totalAmount };
    const { data: order, error: orderErr } = await supabase.from('orders').insert(payload).select('id').single();
    if (orderErr || !order) {
      // fallback simulate id
      return { id: `sim-${Date.now()}` };
    }
    const orderId = order.id;
    // insert order items
    const itemsPayload = items.map((it) => ({ order_id: orderId, variant_id: it.variantId, quantity: it.quantity, price_at_purchase: it.price }));
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
    if (itemsErr) {
      // ignore but return order id
      return { id: orderId };
    }
    return { id: orderId };
  } catch (e) {
    return { id: `sim-${Date.now()}` };
  }
}

// Variant + Product aggregation for cart display
export async function getVariantWithProduct(variantId: string): Promise<{ product: Product; variant: ProductVariant } | null> {
  // fetch variant
  const { data: variantRow, error: vErr } = await supabase
    .from('product_variants')
    .select('*')
    .eq('id', variantId)
    .single();
  if (vErr || !variantRow) return null;

  // fetch product
  const { data: productRow, error: pErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', variantRow.product_id)
    .single();
  if (pErr || !productRow) return null;

  // fetch images: prefer variant images else product images
  const { data: variantImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', variantRow.product_id)
    .eq('variant_id', variantId)
    .order('position', { ascending: true });
  const { data: productImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', variantRow.product_id)
    .is('variant_id', null)
    .order('position', { ascending: true });

  const product = mapProductRow(
    productRow,
    [variantRow],
    (variantImages && variantImages.length ? variantImages : productImages) ?? []
  );

  // ensure sizes contains at least the current variant
  const variant: ProductVariant = {
    id: variantRow.id,
    size: String(variantRow.size),
    color: String(variantRow.color ?? ''),
    price: Number(variantRow.price ?? 0),
    stock: Number(variantRow.stock ?? 0),
  };

  // if product.sizes doesn't include this exact variant, add it
  const hasVariant = product.sizes.some((s) => s.id === variant.id);
  if (!hasVariant) {
    product.sizes = [...product.sizes, variant];
  }

  return { product, variant };
}
