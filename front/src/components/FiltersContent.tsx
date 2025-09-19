"use client";
import React from "react";
import type { Product } from "../lib/types"; 

type Props = {
  filterOptions: {
    brands: string[];
    categories: Product["category"][];
    sizes: string[];
    priceBounds: { min: number; max: number };
  };
  selectedBrands: string[];
  selectedCategories: Product["category"][];
  selectedSizes: string[];
  toggleBrand: (b: string) => void;
  toggleCategory: (c: Product["category"]) => void;
  toggleSize: (s: string) => void;
  priceInputs: { min: string; max: string };
  handlePriceInputChange: (i: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePriceInputBlur: (i: 0 | 1) => (e: React.FocusEvent<HTMLInputElement>) => void;
  handlePriceInputKeyDown: (i: 0 | 1) => (e: React.KeyboardEvent<HTMLInputElement>) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  filteredCount: number;
};

const categoryLabels: Record<Product["category"], string> = {
  Homme: "Homme",
  Femme: "Femme",
  Unisexe: "Unisexe",
};

export default function FiltersContent({
  filterOptions,
  selectedBrands,
  selectedCategories,
  selectedSizes,
  toggleBrand,
  toggleCategory,
  toggleSize,
  priceInputs,
  handlePriceInputChange,
  handlePriceInputBlur,
  handlePriceInputKeyDown,
  hasActiveFilters,
  resetFilters,
  filteredCount,
}: Props) {
  const { priceBounds } = filterOptions;

  return (
    <div className="space-y-8">
      {/* Résumé + reset (utile pour la modale mobile) */}
      <div className="flex items-center justify-between lg:hidden">
        <span className="text-sm text-neutral-500">{filteredCount} produits</span>
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm font-medium text-[#015A52] disabled:opacity-40"
          disabled={!hasActiveFilters}
        >
          Reinitialiser
        </button>
      </div>

      {/* Genre */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Genre</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            const label = categoryLabels[category] ?? category;
            return (
              <button
                type="button"
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  isSelected
                    ? "border-[#015A52] bg-[#015A52]/10 text-[#015A52]"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {label}
              </button>
            );
          })}
          {!filterOptions.categories.length && (
            <p className="text-xs text-neutral-400">Aucun genre disponible.</p>
          )}
        </div>
      </section>

      {/* Marque */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Marque</h3>
        <div className="mt-3 space-y-2">
          {filterOptions.brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-[#015A52] focus:ring-[#015A52]"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
          {!filterOptions.brands.length && (
            <p className="text-xs text-neutral-400">Aucune marque disponible.</p>
          )}
        </div>
      </section>

      {/* Taille */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Taille</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.sizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  isSelected
                    ? "border-[#015A52] bg-[#015A52]/10 text-[#015A52]"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {size}
              </button>
            );
          })}
          {!filterOptions.sizes.length && (
            <p className="text-xs text-neutral-400">Aucune taille disponible.</p>
          )}
        </div>
      </section>

      {/* Prix */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-900">Prix</h3>
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex flex-col text-xs text-neutral-500">
              Min
              <input
                type="text"
                inputMode="decimal"
                value={priceInputs.min}
                onChange={handlePriceInputChange(0)}
                onBlur={handlePriceInputBlur(0)}
                onKeyDown={handlePriceInputKeyDown(0)}
                className="mt-1 w-28 rounded border border-neutral-200 px-3 py-2 text-sm focus:border-[#015A52] focus:outline-none focus:ring-2 focus:ring-[#015A52]/20"
                placeholder={`${priceBounds.min}`}
              />
            </label>
            <label className="flex flex-col text-xs text-neutral-500">
              Max
              <input
                type="text"
                inputMode="decimal"
                value={priceInputs.max}
                onChange={handlePriceInputChange(1)}
                onBlur={handlePriceInputBlur(1)}
                onKeyDown={handlePriceInputKeyDown(1)}
                className="mt-1 w-28 rounded border border-neutral-200 px-3 py-2 text-sm focus:border-[#015A52] focus:outline-none focus:ring-2 focus:ring-[#015A52]/20"
                placeholder={`${priceBounds.max}`}
              />
            </label>
          </div>
          <p className="text-xs text-neutral-500">
            Intervalle : {priceBounds.min} EUR - {priceBounds.max} EUR
          </p>
        </div>
      </section>
    </div>
  );
}
