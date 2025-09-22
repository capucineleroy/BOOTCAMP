import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  mapPostgrestError,
  validateProductCreatePayload,
  validateProductUpdatePayload,
  type ProductCreateRequest,
  type ProductUpdateRequest,
} from "@/lib/adminProductValidation";

interface AdminAuthSuccess {
  userId: string;
}

const ADMIN_EMAIL_ENV = process.env.ADMIN_EMAIL_WHITELIST ?? process.env.ADMIN_ALLOWED_EMAILS ?? "";
const ADMIN_EMAILS = ADMIN_EMAIL_ENV
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function requireAdmin(request: NextRequest): Promise<AdminAuthSuccess | NextResponse> {
  const authHeader = request.headers.get("authorization");
  console.debug("[requireAdmin] Authorization header:", authHeader);
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing admin bearer token." }, { status: 401 });
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    return NextResponse.json({ error: "Invalid bearer token." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  console.debug("[requireAdmin] supabase.getUser result:", { data, error });
  if (error || !data?.user) {
    return NextResponse.json({ error: "Unable to authenticate admin." }, { status: 401 });
  }

  const user = data.user;
  const role = String((user.app_metadata?.role ?? user.user_metadata?.role ?? "")).toLowerCase();
  const email = user.email?.toLowerCase();
  const emailAllowed = ADMIN_EMAILS.length ? (email ? ADMIN_EMAILS.includes(email) : false) : false;

  if (role !== "admin" && !emailAllowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return { userId: user.id };
}

function generateSku(base: string, color: string, size: string): string {
  const baseSegment = base.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "PRD";
  const colorSegment = color.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "CLR";
  const sizeSegment = size.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "SIZ";
  const randomSegment = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `${baseSegment}-${colorSegment}-${sizeSegment}-${randomSegment}`;
}

async function fetchProductAggregate(productId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("id", productId)
    .single();
  if (error) throw error;
  return data;
}

type VariantRecord = {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
};

type ImageRecord = {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  is_thumbnail: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
};

function sanitizeNullable(value: string | null | undefined) {
  return value ?? null;
}

function resolveVariantId(ref: string | null | undefined, maps: { client: Map<string, string>; existing: Map<string, string> }) {
  if (ref === null || ref === undefined || ref === "") return null;
  if (maps.existing.has(ref)) return maps.existing.get(ref)!;
  if (maps.client.has(ref)) return maps.client.get(ref)!;
  return null;
}

async function insertProductCascade(payload: ProductCreateRequest) {
  const insertedVariantIds: string[] = [];
  const insertedImageIds: string[] = [];

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      title: payload.title,
      slug: payload.slug,
      description: sanitizeNullable(payload.description ?? null),
      brand: sanitizeNullable(payload.brand ?? null),
      category: payload.category,
    })
    .select("*")
    .single();

  if (productError || !product) {
    throw productError ?? new Error("Failed to insert product.");
  }

  const productId: string = product.id;
  const clientVariantMap = new Map<string, string>();
  const variantIdMap = new Map<string, string>();

  for (const variant of payload.variants) {
    const sku = generateSku(payload.slug, variant.color, variant.size);
    const { data: insertedVariant, error: variantError } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id: productId,
        sku,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock: variant.stock,
      })
      .select("*")
      .single();

    if (variantError || !insertedVariant) {
      throw { stage: "variant", error: variantError };
    }

    insertedVariantIds.push(insertedVariant.id);
    variantIdMap.set(insertedVariant.id, insertedVariant.id);
    if (variant.clientId) {
      clientVariantMap.set(variant.clientId, insertedVariant.id);
    }
  }

  if (payload.images.length) {
    for (const image of payload.images) {
      const variantRefValue = image.variantRef ?? null;
      const variantId = resolveVariantId(variantRefValue, {
        client: clientVariantMap,
        existing: variantIdMap,
      });
      if (typeof image.variantRef === "string" && !variantId) {
        throw { stage: "image", error: new Error("Unknown variant reference for image.") };
      }
      const { data: insertedImage, error: imageError } = await supabaseAdmin
        .from("product_images")
        .insert({
          product_id: productId,
          variant_id: variantId,
          url: image.url,
          is_thumbnail: image.isThumbnail,
          position: image.position,
        })
        .select("*")
        .single();

      if (imageError || !insertedImage) {
        throw { stage: "image", error: imageError };
      }

      insertedImageIds.push(insertedImage.id);
    }
  }

  return {
    product,
    productId,
    insertedVariantIds,
    insertedImageIds,
  };
}

async function cleanupProductCascade(productId: string | null, variantIds: string[], imageIds: string[]) {
  if (imageIds.length) {
    await supabaseAdmin.from("product_images").delete().in("id", imageIds);
  }
  if (variantIds.length) {
    await supabaseAdmin.from("product_variants").delete().in("id", variantIds);
  }
  if (productId) {
    await supabaseAdmin.from("products").delete().eq("id", productId);
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validateProductCreatePayload(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
  }

  let cascadeResult: Awaited<ReturnType<typeof insertProductCascade>> | null = null;

  try {
    cascadeResult = await insertProductCascade(validation.data);
    const aggregate = await fetchProductAggregate(cascadeResult.productId);
    return NextResponse.json(aggregate, { status: 201 });
  } catch (caught) {
    const errorPayload = (caught as { error?: unknown }).error ?? caught;
    await cleanupProductCascade(cascadeResult?.productId ?? null, cascadeResult?.insertedVariantIds ?? [], cascadeResult?.insertedImageIds ?? []);
    const mapped = mapPostgrestError(errorPayload);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validateProductUpdatePayload(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
  }

  const payload: ProductUpdateRequest = validation.data;

  const { data: currentProduct, error: fetchError } = await supabaseAdmin
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("id", payload.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const existingVariants = Array.isArray((currentProduct as any).product_variants)
    ? ((currentProduct as any).product_variants as VariantRecord[])
    : [];
  const existingImages = Array.isArray((currentProduct as any).product_images)
    ? ((currentProduct as any).product_images as ImageRecord[])
    : [];

  const existingVariantMap = new Map(existingVariants.map((variant) => [variant.id, variant]));
  const existingImageMap = new Map(existingImages.map((image) => [image.id, image]));

  const invalidVariantIds = payload.variants.filter((variant) => variant.id && !existingVariantMap.has(variant.id));
  if (invalidVariantIds.length) {
    return NextResponse.json({ error: "One or more variant ids are invalid for this product." }, { status: 400 });
  }

  const invalidImageIds = payload.images.filter((image) => image.id && !existingImageMap.has(image.id));
  if (invalidImageIds.length) {
    return NextResponse.json({ error: "One or more image ids are invalid for this product." }, { status: 400 });
  }

  const revertStack: Array<() => Promise<void>> = [];
  const variantClientMap = new Map<string, string>();
  const variantIdMap = new Map(existingVariants.map((variant) => [variant.id, variant.id]));

  try {
    const previousProductState = {
      title: currentProduct.title,
      description: currentProduct.description ?? null,
      brand: currentProduct.brand ?? null,
      category: currentProduct.category,
      slug: currentProduct.slug,
    };

    const productUpdate: Record<string, unknown> = {
      title: payload.title,
      description: sanitizeNullable(payload.description ?? null),
      brand: sanitizeNullable(payload.brand ?? null),
      category: payload.category,
      updated_at: new Date().toISOString(),
    };

    if (payload.slug) {
      productUpdate.slug = payload.slug;
    }

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update(productUpdate)
      .eq("id", payload.id);

    if (updateError) {
      throw { stage: "product", error: updateError };
    }

    revertStack.push(async () => {
      await supabaseAdmin
        .from("products")
        .update({
          title: previousProductState.title,
          description: previousProductState.description,
          brand: previousProductState.brand,
          category: previousProductState.category,
          slug: previousProductState.slug,
        })
        .eq("id", payload.id);
    });

    const requestedVariantIds = new Set<string>();

    for (const variant of payload.variants) {
      if (variant.id) {
        requestedVariantIds.add(variant.id);
        const before = existingVariantMap.get(variant.id)!;
        const updatePayload = {
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
          updated_at: new Date().toISOString(),
        };

        const { error: variantUpdateError } = await supabaseAdmin
          .from("product_variants")
          .update(updatePayload)
          .eq("id", variant.id);

        if (variantUpdateError) {
          throw { stage: "variant", error: variantUpdateError };
        }

        revertStack.push(async () => {
          await supabaseAdmin
            .from("product_variants")
            .update({
              size: before.size,
              color: before.color,
              price: before.price,
              stock: before.stock,
              updated_at: before.updated_at ?? before.created_at,
            })
            .eq("id", variant.id);
        });
      } else {
        const sku = generateSku(payload.slug ?? currentProduct.slug, variant.color, variant.size);
        const { data: insertedVariant, error: insertVariantError } = await supabaseAdmin
          .from("product_variants")
          .insert({
            product_id: payload.id,
            sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            stock: variant.stock,
          })
          .select("*")
          .single();

        if (insertVariantError || !insertedVariant) {
          throw { stage: "variant", error: insertVariantError };
        }

        requestedVariantIds.add(insertedVariant.id);
        variantIdMap.set(insertedVariant.id, insertedVariant.id);
        if (variant.clientId) {
          variantClientMap.set(variant.clientId, insertedVariant.id);
        }

        revertStack.push(async () => {
          await supabaseAdmin.from("product_variants").delete().eq("id", insertedVariant.id);
        });
      }
    }

    const variantsToDelete = existingVariants.filter((variant) => !requestedVariantIds.has(variant.id));

    for (const variant of variantsToDelete) {
      const { error: deleteVariantError } = await supabaseAdmin
        .from("product_variants")
        .delete()
        .eq("id", variant.id);

      if (deleteVariantError) {
        throw { stage: "variant", error: deleteVariantError };
      }

      revertStack.push(async () => {
        await supabaseAdmin.from("product_variants").insert({
          id: variant.id,
          product_id: variant.product_id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
          created_at: variant.created_at,
          updated_at: variant.updated_at,
        });
      });
    }

    const requestedImageIds = new Set<string>();

    for (const image of payload.images) {
      const hasVariantRef = Object.prototype.hasOwnProperty.call(image, "variantRef");
      const variantRefValue = hasVariantRef ? image.variantRef ?? null : null;
      const resolvedVariantId = hasVariantRef ? resolveVariantId(variantRefValue, { client: variantClientMap, existing: variantIdMap }) : null;
      if (hasVariantRef && typeof image.variantRef === "string" && !resolvedVariantId) {
        throw { stage: "image", error: new Error("Unknown variant reference for image.") };
      }

      if (image.id) {
        requestedImageIds.add(image.id);
        const before = existingImageMap.get(image.id)!;
        const updatePayload: Record<string, unknown> = {
          url: image.url,
          is_thumbnail: image.isThumbnail,
          position: image.position,
        };

        if (hasVariantRef) {
          updatePayload.variant_id = resolvedVariantId;
        }

        const { error: imageUpdateError } = await supabaseAdmin
          .from("product_images")
          .update(updatePayload)
          .eq("id", image.id);

        if (imageUpdateError) {
          throw { stage: "image", error: imageUpdateError };
        }

        revertStack.push(async () => {
          await supabaseAdmin
            .from("product_images")
            .update({
              url: before.url,
              is_thumbnail: before.is_thumbnail,
              position: before.position,
              variant_id: before.variant_id,
            })
            .eq("id", before.id);
        });
      } else {
        const { data: insertedImage, error: imageInsertError } = await supabaseAdmin
          .from("product_images")
          .insert({
            product_id: payload.id,
            variant_id: hasVariantRef ? resolvedVariantId : null,
            url: image.url,
            is_thumbnail: image.isThumbnail,
            position: image.position,
          })
          .select("*")
          .single();

        if (imageInsertError || !insertedImage) {
          throw { stage: "image", error: imageInsertError };
        }

        requestedImageIds.add(insertedImage.id);

        revertStack.push(async () => {
          await supabaseAdmin.from("product_images").delete().eq("id", insertedImage.id);
        });
      }
    }

    const imagesToDelete = existingImages.filter((image) => !requestedImageIds.has(image.id));

    for (const image of imagesToDelete) {
      const { error: deleteImageError } = await supabaseAdmin
        .from("product_images")
        .delete()
        .eq("id", image.id);

      if (deleteImageError) {
        throw { stage: "image", error: deleteImageError };
      }

      revertStack.push(async () => {
        await supabaseAdmin.from("product_images").insert({
          id: image.id,
          product_id: image.product_id,
          variant_id: image.variant_id,
          url: image.url,
          is_thumbnail: image.is_thumbnail,
          position: image.position,
          created_at: image.created_at,
          updated_at: image.updated_at,
        });
      });
    }

    const aggregate = await fetchProductAggregate(payload.id);
    return NextResponse.json(aggregate, { status: 200 });
  } catch (caught) {
    const errorPayload = (caught as { error?: unknown }).error ?? caught;

    for (const revert of revertStack.reverse()) {
      try {
        await revert();
      } catch (revertError) {
        console.error("Failed to revert admin product mutation", revertError);
      }
    }

    const mapped = mapPostgrestError(errorPayload);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}




export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(request.url);
  const productId = url.searchParams.get("id");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
  }

  try {
    // First, get all variants and images to delete them
    const { data: productData, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*), product_images(*)")
      .eq("id", productId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Delete images first
    const imageIds = (productData.product_images ?? []).map((img: any) => img.id);
    if (imageIds.length > 0) {
      const { error: deleteImagesError } = await supabaseAdmin
        .from("product_images")
        .delete()
        .in("id", imageIds);

      if (deleteImagesError) {
        return NextResponse.json({ error: "Failed to delete product images." }, { status: 500 });
      }
    }

    // Delete variants
    const variantIds = (productData.product_variants ?? []).map((variant: any) => variant.id);
    if (variantIds.length > 0) {
      const { error: deleteVariantsError } = await supabaseAdmin
        .from("product_variants")
        .delete()
        .in("id", variantIds);

      if (deleteVariantsError) {
        return NextResponse.json({ error: "Failed to delete product variants." }, { status: 500 });
      }
    }

    // Finally delete the product
    const { error: deleteProductError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteProductError) {
      return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}




