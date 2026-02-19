# Product Catalog & Matching — L2 Full Detail

> Extracted from gravix-final-prd.md Part VII. Complete product matching specification.

# PART VII: PRODUCT MATCHING SPECIFICATION

> **Source document:** `spec-product-matching-spec.md` (v1.0)

**Impact:** This is the difference between "nice AI toy" and "tool I can't work without." An engineer who gets "Two-Part Structural Epoxy with Amine Hardener" still has an hour of product research ahead. An engineer who gets "Henkel Loctite EA 9395 or 3M Scotch-Weld DP460" can issue a PO today.

**What exists today:**

- `product_specifications` table has real TDS data: product_name, manufacturer, chemistry_type, recommended_substrates, operating_temp range, mechanical_properties, cure_schedule, mix_ratio, pot_life, fixture_time
- The failure analysis side already queries this table for TDS lookups (by product name match)
- The spec engine system prompt explicitly forbids brand recommendations: `"Commercial product families (without recommending specific brands)"`
- The AI output JSON has no field for product recommendations

---

## Fix

### Part A: Add product names to the main recommendation (the headline fix)

This is the highest-impact change. One prompt edit, one schema field, one frontend line.

**Backend prompt** â€” `api/prompts/spec_engine.py`

In `get_system_prompt()`, replace:
```
"Commercial product families (without recommending specific brands)"
```
with:
```
"Commercial product families and specific products. Always suggest 2-3 real products by make and model that match the specification."
```

In the JSON schema, update `recommended_spec`:
```json
"recommended_spec": {
    "title": "string - e.g., 'Two-Part Structural Epoxy'",
    "chemistry": "string - e.g., 'Modified Bisphenol-A Epoxy with Amine Hardener'",
    "example_products": ["Loctite EA 9395", "3M Scotch-Weld DP460", "Permabond ET5428"],
    "rationale": "string - why this chemistry was selected"
}
```

**Frontend type** â€” `frontend/src/components/tool/SpecResults.tsx`

Add to the `recommendedSpec` interface:
```tsx
interface SpecResultData {
  recommendedSpec: {
    materialType: string;
    chemistry: string;
    subcategory: string;
    rationale: string;
    exampleProducts?: string[];  // â† ADD
  };
  // ...
}
```

**Frontend render** â€” same file, after the chemistry subtitle (line ~143):
```tsx
<h2 className="text-2xl font-bold text-white">{data.recommendedSpec.materialType}</h2>
<p className="text-sm text-[#94A3B8] mt-1">{data.recommendedSpec.chemistry}</p>
{data.recommendedSpec.exampleProducts?.length > 0 && (
  <p className="text-sm text-accent-500 mt-1.5 font-medium">
    e.g., {data.recommendedSpec.exampleProducts.join(' Â· ')}
  </p>
)}
```

That's it. Now "Structural Cyanoacrylate Adhesive" becomes:

> **Structural Cyanoacrylate Adhesive**
> *Ethyl Cyanoacrylate with Toughening Agents and Hydrolysis Inhibitors*
> **e.g., Loctite 480 Â· Permabond 731 Â· 3M PR100**

The engineer instantly knows what to buy. 20 minutes of work.

**Time:** 20 min

---

### Part B: "Matching Products" section from database (verified data)

**Don't change the vendor-neutral spec** â€” that's the engineering specification, and it's valuable as-is. Add a new section BELOW it: "Products matching this specification."

**Backend â€” new function in `services/ai_engine.py` or `routers/specify.py`:**

After `generate_spec()` returns the AI result, query `product_specifications` for matches:

```python
async def find_matching_products(spec_result: dict, spec_data: dict) -> list[dict]:
    """Query product_specifications for products matching the generated spec."""
    db = get_supabase()
    
    chemistry = spec_result.get("recommended_spec", {}).get("chemistry", "")
    substrate_a = spec_data.get("substrate_a", "")
    substrate_b = spec_data.get("substrate_b", "")
    
    # Strategy: query by chemistry type, then score against spec requirements
    candidates = []
    
    # 1. Match by chemistry type keywords
    chemistry_keywords = extract_chemistry_keywords(chemistry)
    # e.g., "Ethyl Cyanoacrylate" â†’ ["cyanoacrylate", "ethyl"]
    # e.g., "Modified Bisphenol-A Epoxy" â†’ ["epoxy", "bisphenol"]
    
    for keyword in chemistry_keywords[:3]:
        result = db.table("product_specifications") \
            .select("*") \
            .ilike("chemistry_type", f"%{keyword}%") \
            .limit(10) \
            .execute()
        candidates.extend(result.data or [])
    
    # 2. Deduplicate
    seen = set()
    unique = []
    for c in candidates:
        if c["id"] not in seen:
            seen.add(c["id"])
            unique.append(c)
    
    # 3. Score each candidate against spec requirements
    scored = []
    for product in unique:
        score = 0
        reasons = []
        
        # Temperature range match
        spec_chars = spec_result.get("product_characteristics", {})
        prod_min = product.get("operating_temp_min_c")
        prod_max = product.get("operating_temp_max_c")
        env = spec_data.get("environment", {})
        req_min = env.get("temp_min")
        req_max = env.get("temp_max")
        
        if prod_min is not None and req_min is not None and prod_min <= req_min:
            score += 1
            reasons.append("Temperature range covers requirement")
        if prod_max is not None and req_max is not None and prod_max >= req_max:
            score += 1
        
        # Substrate compatibility
        recommended_subs = product.get("recommended_substrates", [])
        if recommended_subs:
            sub_text = " ".join(str(s) for s in recommended_subs).lower()
            if substrate_a.lower().split()[0] in sub_text:
                score += 2
                reasons.append(f"Recommended for {substrate_a}")
            if substrate_b.lower().split()[0] in sub_text:
                score += 2
                reasons.append(f"Recommended for {substrate_b}")
        
        # Mechanical properties available
        mech = product.get("mechanical_properties", {})
        if mech:
            score += 1
            reasons.append("Datasheet properties available")
        
        scored.append({
            "product_name": product["product_name"],
            "manufacturer": product.get("manufacturer"),
            "chemistry_type": product.get("chemistry_type"),
            "score": score,
            "reasons": reasons,
            "operating_temp": f"{prod_min}Â°C to {prod_max}Â°C" if prod_min and prod_max else None,
            "shear_strength": mech.get("shear_strength") or mech.get("lap_shear_strength"),
            "cure_time": product.get("cure_schedule", {}).get("full_cure") or product.get("fixture_time_minutes"),
            "product_id": product["id"],
            "tds_available": bool(product.get("tds_file_url")),
        })
    
    # 4. Sort by score, return top 3
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:3]
```

**Update `create_spec` endpoint** in `specify.py`:

```python
# After AI generation:
matching_products = []
try:
    matching_products = await find_matching_products(ai_result, data_dict)
except Exception as e:
    logger.warning(f"Product matching failed (non-fatal): {e}")

update_data["matching_products"] = matching_products
```

### Part C: Frontend â€” "Matching Products" card

**File:** `frontend/src/components/tool/SpecResults.tsx`

Add below the Alternatives section:

```tsx
{/* Matching Products */}
{data.matching_products?.length > 0 && (
  <section>
    <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
      <Package className="w-4 h-4 text-accent-500" />
      Products Matching This Spec
    </h2>
    <div className="space-y-3">
      {data.matching_products.map((product, i) => (
        <div key={i} className="border border-[#1F2937] rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-medium">
                {product.product_name}
                {product.tds_available && (
                  <span className="ml-2 text-[10px] bg-accent-500/20 text-accent-500 px-1.5 py-0.5 rounded">
                    âœ“ TDS on file
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {product.manufacturer} Â· {product.chemistry_type}
              </p>
            </div>
          </div>
          
          {/* Key specs vs requirement */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-xs">
            {product.operating_temp && (
              <div>
                <span className="text-[#64748B]">Temp Range</span>
                <span className="text-white ml-2">{product.operating_temp}</span>
              </div>
            )}
            {product.shear_strength && (
              <div>
                <span className="text-[#64748B]">Shear Strength</span>
                <span className="text-white ml-2">{product.shear_strength}</span>
              </div>
            )}
            {product.cure_time && (
              <div>
                <span className="text-[#64748B]">Cure</span>
                <span className="text-white ml-2">{product.cure_time}</span>
              </div>
            )}
          </div>
          
          {/* Match reasons */}
          {product.reasons?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.reasons.map((r, j) => (
                <span key={j} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                  âœ“ {r}
                </span>
              ))}
            </div>
          )}
          
          {/* Link to product page */}
          <a
            href={`/products/${product.product_id}`}
            className="text-xs text-accent-500 hover:underline mt-2 inline-block"
          >
            View full product data â†’
          </a>
        </div>
      ))}
    </div>
    
    {data.matching_products.length === 0 && (
      <p className="text-sm text-[#64748B]">
        No products in the Gravix database match this specification yet.
        <a href="/products" className="text-accent-500 hover:underline ml-1">
          Upload a TDS to add products â†’
        </a>
      </p>
    )}
  </section>
)}
```

### Part D: Upgrade moment â€” "More products" for paid users

For free users, show 1 matching product. For Pro+, show all 3. Below the single result for free:

```tsx
{isFree && data.matching_products.length > 1 && (
  <div className="border border-accent-500/20 rounded-lg p-3 text-center">
    <p className="text-sm text-[#94A3B8]">
      {data.matching_products.length - 1} more matching products available
    </p>
    <a href="/pricing" className="text-xs text-accent-500 hover:underline">
      Upgrade to Pro to see all matches â†’
    </a>
  </div>
)}
```

---

## Files changed

| File | Change |
|------|--------|
| `api/prompts/spec_engine.py` | Remove "without recommending specific brands", add `example_products` to JSON schema, tell Claude to suggest 2-3 real products |
| `api/routers/specify.py` | Call `find_matching_products()` after AI generation, save to record |
| `api/services/ai_engine.py` or new `services/product_matching.py` | `find_matching_products()` function |
| `frontend/src/components/tool/SpecResults.tsx` | Add `exampleProducts` to type + render below chemistry, add "Matching Products" section below Alternatives |
| `api/schemas/specify.py` | Add `matching_products` and `example_products` to response schema |

## Testing

1. Run spec for "Aluminum 6061-T6 + ABS" with Cyanoacrylate considered â†’ **verify product names appear below chemistry subtitle** (e.g., "e.g., Loctite 480 Â· Permabond 731 Â· 3M PR100")
2. Run spec for "Steel + Steel" structural epoxy â†’ verify different product names (e.g., "e.g., Loctite EA 9395 Â· 3M DP460")
3. Verify matching products section below shows database products with "âœ“ TDS on file" where applicable
4. Run spec where no products match (exotic chemistry) â†’ verify graceful "No products match" message with upload CTA. AI-suggested names in subtitle should still appear.
5. Free user â†’ verify only 1 database-matched product shown with upgrade prompt
6. Pro user â†’ verify all 3 database matches shown
7. Click "View full product data â†’" â†’ verify links to product page

## Product note

The matching will only be as good as the product database. Early on, the database will be thin. The "Upload a TDS to add products â†’" CTA turns this into a flywheel: users upload TDS â†’ database grows â†’ matches improve â†’ more users engage. Consider seeding the database with 20-30 common adhesive TDS files (Loctite 401, 406, 480, 3M DP460, DP810, Permabond 910, etc.) to bootstrap the matching.

---

