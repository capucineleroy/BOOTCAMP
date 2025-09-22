import type { PostgrestError } from "@supabase/supabase-js";

export interface VariantUpsertRequest {
  id?: string;
  clientId?: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

export interface ImageUpsertRequest {
  id?: string;
  url: string;
  isThumbnail: boolean;
  position: number;
  variantRef?: string | null;
}

export interface ProductCreateRequest {
  title: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  category: string;
  variants: VariantUpsertRequest[];
  images: ImageUpsertRequest[];
}

export interface ProductUpdateRequest extends Omit<ProductCreateRequest, "slug"> {
  id: string;
  slug?: string;
}

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  errors: string[];
}

const SLUG_SAFE_REGEX = /[^a-z0-9-]+/g;

const NON_WORD_REGEX = /[^a-z0-9]+/gi;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);
}

function normalizeSlug(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(NON_WORD_REGEX, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
  return trimmed.replace(SLUG_SAFE_REGEX, "");
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function coerceClientId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function coerceInteger(value: unknown): number | null {
  const num = coerceNumber(value);
  if (num === null) return null;
  if (!Number.isInteger(num)) return null;
  return num;
}

function sanitizeVariant(input: any, errors: string[], index: number, allowId: boolean): VariantUpsertRequest | null {
  const size = normalizeNullableString(input?.size);
  if (!size) errors.push(`variants[${index}].size is required.`);

  const color = normalizeNullableString(input?.color);
  if (!color) errors.push(`variants[${index}].color is required.`);

  const price = coerceNumber(input?.price);
  if (price === null || price < 0) errors.push(`variants[${index}].price must be a number >= 0.`);

  const stock = coerceInteger(input?.stock);
  if (stock === null || stock < 0) errors.push(`variants[${index}].stock must be an integer >= 0.`);

  const variant: VariantUpsertRequest = {
    size: size ?? "",
    color: color ?? "",
    price: price ?? 0,
    stock: stock ?? 0,
  };

  if (allowId && input?.id) {
    if (!isUuid(input.id)) errors.push(`variants[${index}].id must be a valid uuid.`);
    else variant.id = input.id;
  }

  const clientId = coerceClientId(input?.clientId);
  if (clientId) variant.clientId = clientId;

  return size && color && price !== null && price >= 0 && stock !== null && stock >= 0 ? variant : null;
}

function sanitizeImage(input: any, errors: string[], index: number, allowId: boolean): ImageUpsertRequest | null {
  const url = normalizeNullableString(input?.url);
  if (!url) errors.push(`images[${index}].url is required.`);

  const isThumbnail = Boolean(input?.isThumbnail);
  const position = coerceInteger(input?.position ?? index);
  if (position === null || position < 0) errors.push(`images[${index}].position must be an integer >= 0.`);

  const image: ImageUpsertRequest = {
    url: url ?? "",
    isThumbnail,
    position: position ?? index,
  };

  if (allowId && input?.id) {
    if (!isUuid(input.id)) errors.push(`images[${index}].id must be a valid uuid.`);
    else image.id = input.id;
  }

  const variantRef = normalizeNullableString(input?.variantRef) ?? normalizeNullableString(input?.variantId) ?? normalizeNullableString(input?.variant_id);
  if (variantRef) image.variantRef = variantRef;
  else if (input?.variantRef === null || input?.variantId === null || input?.variant_id === null) image.variantRef = null;

  return url && position !== null && position >= 0 ? image : null;
}

function ensureThumbnail(images: ImageUpsertRequest[]): ImageUpsertRequest[] {
  if (!images.length) return images;
  const hasThumbnail = images.some((img) => img.isThumbnail);
  if (hasThumbnail) return images;
  const [first, ...rest] = images;
  return [{ ...first, isThumbnail: true }, ...rest];
}

function dedupeClientIds(items: VariantUpsertRequest[], errors: string[]) {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (item.clientId) {
      if (seen.has(item.clientId)) {
        errors.push(`variants[${index}].clientId must be unique.`);
      } else {
        seen.add(item.clientId);
      }
    }
  });
}

export function validateProductCreatePayload(input: unknown): ValidationSuccess<ProductCreateRequest> | ValidationFailure {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { success: false, errors: ["Payload must be an object."] };
  }

  const raw = input as Record<string, any>;

  const title = normalizeNullableString(raw.title);
  if (!title) errors.push("title is required.");

  const slugSource = normalizeNullableString(raw.slug ?? raw.title);
  if (!slugSource) errors.push("slug is required.");
  const slug = slugSource ? normalizeSlug(slugSource) : "";
  if (!slug.length) errors.push("slug must contain alphanumeric characters.");

  const category = normalizeNullableString(raw.category);
  if (!category) errors.push("category is required.");

  const variantsArray = Array.isArray(raw.variants) ? raw.variants : [];
  if (!variantsArray.length) errors.push("variants must be a non-empty array.");
  const variants: VariantUpsertRequest[] = variantsArray
    .map((variant, index) => sanitizeVariant(variant, errors, index, false))
    .filter((v): v is VariantUpsertRequest => Boolean(v));
  dedupeClientIds(variants, errors);

  const imagesArray = Array.isArray(raw.images) ? raw.images : [];
  const images = ensureThumbnail(
    imagesArray
      .map((image, index) => sanitizeImage(image, errors, index, false))
      .filter((i): i is ImageUpsertRequest => Boolean(i))
      .map((image, position) => ({ ...image, position }))
  );

  if (errors.length) {
    return { success: false, errors: Array.from(new Set(errors)) };
  }

  return {
    success: true,
    data: {
      title: title!,
      slug,
      description: normalizeNullableString(raw.description),
      brand: normalizeNullableString(raw.brand),
      category: category!,
      variants,
      images,
    },
  };
}

export function validateProductUpdatePayload(input: unknown): ValidationSuccess<ProductUpdateRequest> | ValidationFailure {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { success: false, errors: ["Payload must be an object."] };
  }

  const raw = input as Record<string, any>;

  if (!raw.id || !isUuid(raw.id)) errors.push("id is required and must be a valid uuid.");

  const title = normalizeNullableString(raw.title);
  if (!title) errors.push("title is required.");

  const category = normalizeNullableString(raw.category);
  if (!category) errors.push("category is required.");

  let slug: string | undefined;
  if (raw.slug !== undefined) {
    const slugSource = normalizeNullableString(raw.slug);
    if (!slugSource) errors.push("slug must be a non-empty string when provided.");
    else slug = normalizeSlug(slugSource);
    if (slug && !slug.length) errors.push("slug must contain alphanumeric characters.");
  }

  const variantsArray = Array.isArray(raw.variants) ? raw.variants : [];
  if (!variantsArray.length) errors.push("variants must be a non-empty array.");
  const variants: VariantUpsertRequest[] = variantsArray
    .map((variant, index) => sanitizeVariant(variant, errors, index, true))
    .filter((v): v is VariantUpsertRequest => Boolean(v));
  dedupeClientIds(variants.filter((v) => !v.id), errors);

  const imagesArray = Array.isArray(raw.images) ? raw.images : [];
  const images = ensureThumbnail(
    imagesArray
      .map((image, index) => sanitizeImage(image, errors, index, true))
      .filter((i): i is ImageUpsertRequest => Boolean(i))
      .map((image, position) => ({ ...image, position }))
  );

  if (errors.length) {
    return { success: false, errors: Array.from(new Set(errors)) };
  }

  return {
    success: true,
    data: {
      id: raw.id,
      title: title!,
      slug,
      description: normalizeNullableString(raw.description),
      brand: normalizeNullableString(raw.brand),
      category: category!,
      variants,
      images,
    },
  };
}

export function mapPostgrestError(error: unknown): { status: number; message: string } {
  if (error && typeof error === "object" && "code" in error) {
    const err = error as PostgrestError;
    if (err.code === "23505") {
      const detail = (err.details ?? err.message ?? "").toLowerCase();
      if (detail.includes("slug")) {
        return { status: 409, message: "slug already exists" };
      }
      if (detail.includes("sku")) {
        return { status: 409, message: "sku already exists" };
      }
      return { status: 409, message: "unique constraint violated" };
    }
    if (err.code === "23503") {
      return { status: 400, message: "invalid foreign key reference" };
    }
    if (err.code === "23514") {
      return { status: 400, message: "constraint check failed" };
    }
    if (err.message) {
      return { status: 400, message: err.message };
    }
  }
  if (error instanceof Error) {
    return { status: 400, message: error.message };
  }
  return { status: 400, message: "unknown error" };
}

export function normalizeImageVariantRef(ref: string | null | undefined): string | null {
  if (ref === undefined) return null;
  if (ref === null) return null;
  const trimmed = ref.trim();
  return trimmed.length ? trimmed : null;
}

