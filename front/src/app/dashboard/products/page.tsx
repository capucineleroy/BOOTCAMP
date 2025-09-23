"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '../../../lib/supabaseApi';
import { Product } from '../../../lib/types';
import AdminGuard from '@/components/AdminGuard';

export default function ProductsAdmin() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    name: '',
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: ''
  });

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleEdit = (productId: string) => {
    router.push(`/admin/products?id=${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    setLoadingDelete(productId);

    try {
      // Use the new DELETE API
      const { supabase } = await import('../../../lib/supabaseClient');
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes?.data?.session?.access_token;

      if (!accessToken) {
        alert('Erreur d\'authentification');
        return;
      }

      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Produit supprimé avec succès');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(err.message || 'Erreur lors de la suppression du produit');
    } finally {
      setLoadingDelete(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      brand: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: ''
    });
  };

  const getTotalStock = (product: Product) => {
    return product.sizes.reduce((total, size) => total + size.stock, 0);
  };

  const filteredProducts = products.filter(product => {
    // Filter by name
    if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    // Filter by brand
    if (filters.brand && !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }

    // Filter by price range
    const price = product.price;
    if (filters.minPrice && price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && price > parseFloat(filters.maxPrice)) {
      return false;
    }

    // Filter by stock range
    const totalStock = getTotalStock(product);
    if (filters.minStock && totalStock < parseInt(filters.minStock)) {
      return false;
    }
    if (filters.maxStock && totalStock > parseInt(filters.maxStock)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <AdminGuard>
        <div className="container py-8">
          <h1 className="text-2xl font-semibold mb-6">Gestion des produits</h1>
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-neutral-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Gestion des produits</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="bg-[#014545] text-white px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-[#026b6b] transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-[#014545] hover:text-[#026b6b] underline"
            >
              Réinitialiser les filtres
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Nom</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Rechercher par nom..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>

            {/* Brand Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Marque</label>
              <input
                type="text"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                placeholder="Rechercher par marque..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Catégorie</label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder="Rechercher par catégorie..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>

            {/* Price Range */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Prix min (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Prix minimum..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Prix max (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Prix maximum..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>

            {/* Stock Range */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Stock min</label>
              <input
                type="number"
                min="0"
                value={filters.minStock}
                onChange={(e) => handleFilterChange('minStock', e.target.value)}
                placeholder="Stock minimum..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700 mb-2">Stock max</label>
              <input
                type="number"
                min="0"
                value={filters.maxStock}
                onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                placeholder="Stock maximum..."
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-neutral-600">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} affiché{filteredProducts.length !== products.length ? ` sur ${products.length}` : ''}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-6 text-center text-neutral-600">
              {products.length === 0 ? 'Aucun produit trouvé' : 'Aucun produit ne correspond aux filtres'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Marque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Stock total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images[0] || '/adidas.avif'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {product.sizes.length} variante{product.sizes.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{product.brand}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {product.price.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {getTotalStock(product)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="text-[#014545] hover:cursor-pointer hover:text-[#026b6b] mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={loadingDelete === product.id}
                          className="text-rose-600 hover:cursor-pointer hover:text-rose-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingDelete === product.id ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent"></div>
                              <span>Suppression...</span>
                            </>
                          ) : (
                            'Supprimer'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}

