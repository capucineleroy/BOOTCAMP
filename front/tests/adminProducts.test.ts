/// <reference types="jest" />
import { mapPostgrestError, validateProductCreatePayload } from "@/lib/adminProductValidation";

interface ExampleCase {
  name: string;
  method: "POST" | "PUT";
  payload: Record<string, unknown>;
  assertions: string[];
}

export const adminProductPayloadExamples: Record<string, ExampleCase> = {
  success: {
    name: "Create product with variants and images",
    method: "POST",
    payload: {
      title: "Air Jordan 1 Green",
      slug: "aj1-green",
      description: "Edition limitée en cuir recyclé.",
      brand: "Nike",
      category: "Homme",
      variants: [
        { clientId: "v1", size: "42", color: "Green", price: 189.9, stock: 12 },
        { clientId: "v2", size: "43", color: "Green", price: 189.9, stock: 5 },
      ],
      images: [
        { url: "https://cdn.example.com/products/aj1-green/front.jpg", isThumbnail: true },
        { url: "https://cdn.example.com/products/aj1-green/side.jpg", isThumbnail: false },
      ],
    },
    assertions: [
      "status === 201",
      "body.slug === 'aj1-green'",
      "body.product_variants.length === 2",
    ],
  },
  slugDuplicate: {
    name: "Reject duplicate slug on product creation",
    method: "POST",
    payload: {
      title: "Air Jordan 1 Green",
      slug: "aj1-green",
      category: "Homme",
      variants: [{ clientId: "dup", size: "42", color: "Green", price: 189.9, stock: 2 }],
    },
    assertions: [
      "status === 409",
      "body.error === 'slug already exists'",
    ],
  },
  skuDuplicate: {
    name: "Reject duplicate variant sku on update",
    method: "PUT",
    payload: {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Air Jordan 1 Green",
      category: "Homme",
      variants: [
        { id: "22222222-2222-2222-2222-222222222222", size: "42", color: "Green", price: 189.9, stock: 8 },
        { clientId: "new-dup", size: "42", color: "Green", price: 189.9, stock: 3 },
      ],
      images: [],
    },
    assertions: [
      "status === 409",
      "body.error === 'sku already exists'",
    ],
  },
};

describe("adminProductPayloadExamples", () => {
  test("success payload passes validation", () => {
    const result = validateProductCreatePayload(adminProductPayloadExamples.success.payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("aj1-green");
      expect(result.data.variants).toHaveLength(2);
      expect(result.data.images).toHaveLength(2);
    }
    expect(adminProductPayloadExamples.success.assertions).toContain("status === 201");
  });

  test("slug duplicate maps to conflict error", () => {
    const error = {
      code: "23505",
      details: "Key (slug)=(aj1-green) already exists.",
      message: "duplicate key value violates unique constraint \"products_slug_key\"",
    };
    const mapped = mapPostgrestError(error);
    expect(mapped.status).toBe(409);
    expect(mapped.message).toBe("slug already exists");
    expect(adminProductPayloadExamples.slugDuplicate.assertions).toEqual([
      "status === 409",
      "body.error === 'slug already exists'",
    ]);
  });

  test("sku duplicate maps to conflict error", () => {
    const error = {
      code: "23505",
      details: "Key (sku)=(AJ1-GRN-42-ABCDEF) already exists.",
      message: "duplicate key value violates unique constraint \"product_variants_sku_key\"",
    };
    const mapped = mapPostgrestError(error);
    expect(mapped.status).toBe(409);
    expect(mapped.message).toBe("sku already exists");
    expect(adminProductPayloadExamples.skuDuplicate.assertions).toEqual([
      "status === 409",
      "body.error === 'sku already exists'",
    ]);
  });
});

