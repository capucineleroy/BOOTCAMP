"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Mock data for demonstration
const MOCK_ADDRESSES = [
  { label: "10 Rue de la Paix, 75002 Paris", city: "Paris", postalCode: "75002", country: "FR" },
  { label: "15 Avenue des Champs-Élysées, 75008 Paris", city: "Paris", postalCode: "75008", country: "FR" },
  { label: "5 Rue de Rivoli, 75004 Paris", city: "Paris", postalCode: "75004", country: "FR" },
  { label: "20 Boulevard Saint-Germain, 75005 Paris", city: "Paris", postalCode: "75005", country: "FR" },
  { label: "8 Place de la Concorde, 75008 Paris", city: "Paris", postalCode: "75008", country: "FR" }
];

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: {
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
  }) => void;
  placeholder?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Tapez votre adresse...",
  required = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<typeof MOCK_ADDRESSES>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);

      // Filter mock addresses based on input
      const filtered = MOCK_ADDRESSES.filter(addr =>
        addr.label.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSuggestionClick = useCallback((address: typeof MOCK_ADDRESSES[0]) => {
    console.log('Suggestion clicked:', address.label);

    // Update the input value and parent state
    onChange(address.label);
    onSelect({
      addressLine1: address.label,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country
    });

    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  }, [onChange, onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 shadow-inner transition focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full z-50 mt-1 w-full rounded-2xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${
                index === selectedIndex ? 'bg-neutral-100' : ''
              }`}
            >
              <div className="truncate text-neutral-900">
                {suggestion.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
