'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BarChart3, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  getProductCatalog,
  CHEMISTRY_OPTIONS,
  MANUFACTURER_OPTIONS,
  APPLICATION_OPTIONS,
  type ProductCatalogItem,
} from '@/lib/mock-products';

// ============================================================================
// Filter Dropdown Component
// ============================================================================

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-brand-800 border border-[#374151] text-sm text-[#94A3B8] rounded-lg px-4 py-2.5 pr-9 focus:outline-none focus:border-accent-500 transition-colors cursor-pointer hover:border-[#4B5563]"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
    </div>
  );
}

// ============================================================================
// Product Card Component
// ============================================================================

function ProductCard({ product }: { product: ProductCatalogItem }) {
  const failureRateColor =
    product.failureRate < 2
      ? 'text-emerald-400'
      : product.failureRate <= 5
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <Link
      href={`/products/${product.manufacturerSlug}/${product.slug}`}
      className="block bg-brand-800 border border-[#1F2937] rounded-lg p-5 hover:border-accent-500/40 transition-all group"
    >
      {/* Product Name */}
      <h3 className="text-white font-semibold text-base group-hover:text-accent-500 transition-colors">
        {product.name}
      </h3>

      {/* Manufacturer + Chemistry */}
      <p className="text-[#94A3B8] text-sm mt-1">
        {product.manufacturer} • {product.chemistry}
      </p>

      {/* Stats */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="font-mono text-white">{product.totalApplications}</span>
          <span className="text-[#64748B]">applications</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#64748B]">Field failure:</span>
          <span className={`font-mono font-medium ${failureRateColor}`}>
            {product.failureRate}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#64748B]">Top failure:</span>
          <span className="text-[#94A3B8]">{product.topFailureMode}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 pt-3 border-t border-[#1F2937]">
        <span className="text-accent-500 text-sm font-medium group-hover:text-accent-400 transition-colors">
          View Performance →
        </span>
      </div>
    </Link>
  );
}

// ============================================================================
// Products Page
// ============================================================================

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [chemistryFilter, setChemistryFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('');

  const products = useMemo(
    () =>
      getProductCatalog({
        search,
        chemistry: chemistryFilter,
        manufacturer: manufacturerFilter,
        application: applicationFilter,
      }),
    [search, chemistryFilter, manufacturerFilter, applicationFilter]
  );

  const hasActiveFilters = search || chemistryFilter || manufacturerFilter || applicationFilter;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">
              Adhesive Product Database
            </h1>
            <p className="text-[#94A3B8] mt-2 text-base">
              Field performance data from real production applications — not just manufacturer claims.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10 h-11 bg-brand-800 border-[#374151] text-sm text-white placeholder:text-[#64748B]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <FilterDropdown
            label="Chemistry"
            value={chemistryFilter}
            options={CHEMISTRY_OPTIONS}
            onChange={setChemistryFilter}
          />
          <FilterDropdown
            label="Manufacturer"
            value={manufacturerFilter}
            options={MANUFACTURER_OPTIONS}
            onChange={setManufacturerFilter}
          />
          <FilterDropdown
            label="Application"
            value={applicationFilter}
            options={APPLICATION_OPTIONS}
            onChange={setApplicationFilter}
          />

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setChemistryFilter('');
                setManufacturerFilter('');
                setApplicationFilter('');
              }}
              className="text-sm text-accent-500 hover:text-accent-400 transition-colors"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-[#64748B]">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-[#374151] mx-auto mb-4" />
            <p className="text-[#94A3B8] text-lg">No products match your filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setChemistryFilter('');
                setManufacturerFilter('');
                setApplicationFilter('');
              }}
              className="mt-3 text-accent-500 hover:text-accent-400 text-sm font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#64748B]">
            Performance data is anonymized and aggregated from Gravix platform analyses.
            Only products with ≥10 documented applications are shown.
          </p>
        </div>
      </div>
    </div>
  );
}
