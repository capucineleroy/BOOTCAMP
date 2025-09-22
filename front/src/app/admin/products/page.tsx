"use client";
import { useState } from "react";

export default function AdminProductsPage() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    brand: "",
    category: "",
    variants: [{ size: "", color: "", price: 0, stock: 0 }],
    images: [{ url: "", isThumbnail: false }],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
};

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleImageChange = (index: number, field: string, value: string | boolean) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setFormData({ ...formData, images: updatedImages });
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { size: "", color: "", price: 0, stock: 0 }] });
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, { url: "", isThumbnail: false }] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Product created successfully!");
        setFormData({
          title: "",
          slug: "",
          description: "",
          brand: "",
          category: "",
          variants: [{ size: "", color: "", price: 0, stock: 0 }],
          images: [{ url: "", isThumbnail: false }],
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while creating the product.");
    }
  };

  return (
    <div>
      <h1>Admin - Manage Products</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" value={formData.title} onChange={(e) => handleInputChange(e, "title")} required />
        </div>
        <div>
          <label>Slug</label>
          <input type="text" value={formData.slug} onChange={(e) => handleInputChange(e, "slug")} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={formData.description} onChange={(e) => handleInputChange(e, "description")} />
        </div>
        <div>
          <label>Brand</label>
          <input type="text" value={formData.brand} onChange={(e) => handleInputChange(e, "brand")} />
        </div>
        <div>
          <label>Category</label>
          <input type="text" value={formData.category} onChange={(e) => handleInputChange(e, "category")} required />
        </div>
        <div>
          <h3>Variants</h3>
          {formData.variants.map((variant, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Size"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Color"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, "price", parseFloat(e.target.value))}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, "stock", parseInt(e.target.value))}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addVariant}>Add Variant</button>
        </div>
        <div>
          <h3>Images</h3>
          {formData.images.map((image, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Image URL"
                value={image.url}
                onChange={(e) => handleImageChange(index, "url", e.target.value)}
                required
              />
              <label>
                Thumbnail
                <input
                  type="checkbox"
                  checked={image.isThumbnail}
                  onChange={(e) => handleImageChange(index, "isThumbnail", e.target.checked)}
                />
              </label>
            </div>
          ))}
          <button type="button" onClick={addImage}>Add Image</button>
        </div>
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}