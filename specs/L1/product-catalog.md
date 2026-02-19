# Product Catalog & Matching — L1 Summary

> Full detail: `L2/product-catalog-full.md` | Source: gravix-final-prd.md Part VII

## What It Does
Two things: (1) Product name recommendations in AI results — spec engine now suggests specific products like "Loctite EA 9395" instead of just "Two-Part Structural Epoxy". (2) Product catalog pages showing TDS-backed performance data and field failure rates.

## Impact
The difference between "nice AI toy" and "tool I can't work without." An engineer who gets a generic chemistry name still has an hour of product research. An engineer who gets "Loctite EA 9395 · 3M Scotch-Weld DP460" can issue a PO today.

## Routes
- `/products` — public catalog grid (searchable, filterable)
- `/products/[manufacturer]/[slug]` — individual product performance page with field data, CTAs

## Two Parts

### Part A: Product Names in AI Results (Highest Impact — 20 min change)
- Modify spec engine system prompt: replace "Commercial product families (without recommending specific brands)" with "Commercial product families and specific products. Always suggest 2-3 real products by make and model."
- Add `example_products: string[]` to AI output schema
- Render below chemistry subtitle: "e.g., Loctite EA 9395 · 3M Scotch-Weld DP460"

### Part B: Matching Products Section (DB-Verified)
- After AI generates spec result, query `product_specifications` table for matches
- Match by: chemistry type + substrate compatibility + temperature range + cure method
- Score candidates: substrate match (40%), chemistry match (30%), temp range (20%), cure method (10%)
- Display as "Products Matching This Specification" section below AI results
- Each product card: name, manufacturer, chemistry, key specs, match score, CTA to product page

## Key Table
- `product_specifications` — product_name, manufacturer, chemistry_type, recommended_substrates[], operating_temp_min/max, mechanical_properties{}, cure_schedule, mix_ratio, pot_life, fixture_time, tds_url, field_failure_rate, common_failure_modes[]

## API Contracts
```
GET /api/products — { page, search?, chemistry_type?, manufacturer? } → paginated product list
GET /api/products/{manufacturer}/{slug} — product detail with field performance data
GET /api/products/match — { chemistry, substrates[], temp_range?, cure_method? } → scored matches
Product Name Autocomplete: GET /api/products/autocomplete?q=loctite → top 10 matches from product_specifications
```

## Tier Gating
| Feature | Free | Pro | Quality+ |
|---------|------|-----|----------|
| Product names in AI results | ✅ | ✅ | ✅ |
| Product catalog browsing | View only | View only | Full access |
| Field performance data | ❌ | ❌ | ✅ |
| Product page CTAs | Sign up CTA | Upgrade CTA | Full access |

## Critical Validations
- Product matching must never block the primary AI result — if matching fails, show results without products
- Autocomplete: debounced (300ms), min 2 chars, returns top 10 matches
- Match scoring: products with 0 substrate overlap should not appear
- Product pages should work for unauthenticated users (public catalog for SEO) but gate field performance data behind Quality+ tier
