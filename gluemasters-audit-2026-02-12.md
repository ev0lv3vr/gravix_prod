# Gluemasters.com — Full Site Audit (Feb 12, 2026)

## Executive Summary

The site has **massively improved** since Feb 8-9 — the B2B page, use-case landing pages, technical resources, viscosity guide, Our Story, and FAQ are all excellent. The content strategy is strong.

But the **consumer purchase path is broken**, and that's where sales drop off.

---

## 🔴 CRITICAL — Fix These First (Revenue Killers)

### 1. PRICING DISPLAY IS BACKWARDS
**Every single product** shows "Original price $42.99" crossed out → "Current price $45.99"

This literally reads as a **price increase**, not a sale. Shoppers see a strikethrough lower number and a higher current price. This is:
- Confusing at best
- Trust-destroying at worst
- Potentially FTC non-compliant (fake "compare at" pricing)

**Fix:** Either (a) remove compare-at prices entirely and just show $45.99, or (b) if running an actual sale, set compare-at HIGHER than current. Right now it looks like you raised prices and forgot to update the display.

**Affected:** ALL 16oz products ($42.99→$45.99), ALL 8oz products ($25.99→$28.99), ALL 2oz products ($10.99→$13.99), Accelerator ($14.00→$17.00)

### 2. BROKEN LINKS IN VISCOSITY GUIDE
The "Shop" buttons on the Viscosity Guide page use **wrong URLs**:
- `/products/glue-masters-ultra-thin-ca-glue-16oz` → **404**
- `/products/glue-masters-thin-ca-glue-16oz` → **404** (likely)
- `/products/glue-masters-medium-ca-glue-16oz` → **404** (likely)
- `/products/glue-masters-thick-ca-glue-16oz` → **404** (likely)

The actual product URLs are the long legacy ones like `/products/super-large-16-oz-453-gram-bottle-with-protective-cap-thin-05-cps-viscosity`

**Impact:** The viscosity guide is one of the best conversion tools on the site. Every CTA on it is dead.

### 3. CUSTOMER REVIEWS PAGE IS EMPTY
`/pages/customer-reviews` renders a completely blank page — just the header/footer.

The footer JSON reveals you have **1,183 reviews at 4.7 stars** (986 five-star, 92 four-star). That's incredible social proof that's completely hidden.

The review widget data shows `"review_number_local": 0, "review_number_foreign": 0` — looks like the review app integration isn't pulling/displaying reviews.

### 4. COLLECTION PAGES RENDER EMPTY
Both `/collections/16-ounce-bottle-variable-viscosity` and `/collections/8-ounce-bottle-variable-viscosity` return **just the header/footer** — no products displayed.

Anyone clicking "View All 16oz" or "View All 8oz" from Shop All hits a dead end.

### 5. REFUND POLICY LINKS TO WRONG DOMAIN
The refund policy page links to `https://gravixadhesives.com/pages/contact-us` for Customer Service. That's the **wrong brand**. Should be gluemasters.com.

---

## 🟡 HIGH PRIORITY — Conversion Optimization

### 6. NO REVIEWS ON PRODUCT PAGES
Product pages have zero visible reviews/ratings. With 1,183 reviews at 4.7★, this is the single biggest missed conversion lever. Product page reviews are the #1 trust signal for ecommerce.

### 7. HOMEPAGE HAS NO "WHICH GLUE DO I NEED?" PATH
The homepage shows 4 products that look identical. A first-time visitor bounces because they don't know Thick vs Thin.

The viscosity guide exists (`/pages/viscosity-guide`) and it's great — but there's no prominent link from the homepage. Need a "Not sure which one?" CTA above the product grid, or an inline quiz/selector.

### 8. NO PRODUCT IMAGES ON SHOP ALL PAGE (likely)
The readability extraction didn't pick up images. The Shopify CDN images exist (per sitemap) but may not be rendering properly in the current theme, or they all look identical (same white bottle, different label text). Need visual differentiation — color-coded labels, badges, etc.

### 9. MULTIPLE OUT-OF-STOCK PRODUCTS DISPLAYED
On Shop All:
- Thick 2oz — **Out of stock**
- All Purpose 20g — **Out of stock**
- All Purpose 20g 2-Pack — **Out of stock**
- CA Glue Gel 20g — **Out of stock**
- CA Accelerator 6.8oz — **Out of stock**
- 2-Part Epoxy — **Out of stock**

That's 6 of ~16 products showing "Sold out" with no hide/notify option. This makes the catalog feel abandoned. Either hide OOS items or add "Notify Me" back-in-stock buttons.

### 10. FREE SHIPPING THRESHOLD VS PRODUCT PRICING MISMATCH
Free shipping at $74.99. A single 16oz bottle is $45.99. Two bottles = $91.98 (qualifies). But there's no "Buy 2, save X" or bundle to push AOV above the threshold. The pricing math creates a dead zone where 1 bottle doesn't qualify and there's no nudge to add a second.

---

## 🟢 GOOD — What's Working Well

### B2B Page (`/pages/b2b`)
Exceptional. The Shark Tank case study, ROI calculator, problem/solution format, viscosity table, production trial CTA — this is best-in-class B2B industrial marketing.

### Use Case Landing Pages
Six deep-content pages (Woodworking, Coral Fragging, Furniture Repair, Crafts/Models/RC, 3D Printing, Manufacturing) with genuine expertise. These are SEO gold and real conversion content.

### Our Story Page
Strong narrative arc. Real numbers (1,300+ reviews, 4.7★, 50K+ bottles). The Shark Tank testimonial carries weight. Chicago/Made in USA messaging is consistent.

### Technical Resources Hub
SDS/TDS documentation, substrate compatibility matrix, troubleshooting guide. This is procurement-ready content that competitors don't have.

### Viscosity Guide (content, not links)
The selector cards, comparison table, and per-project recommendations are excellent. Just fix the broken CTAs.

### FAQ Page
Comprehensive, well-organized, includes viscosity guide inline.

### Military/Student Discount
Nice touch. Code `HEROES15` for 15%.

---

## 📋 PRIORITIZED ACTION PLAN

| Priority | Issue | Effort | Revenue Impact |
|----------|-------|--------|----------------|
| P0 | Fix pricing display (remove bad compare-at prices) | 30 min (Shopify admin) | HIGH — stops active trust damage |
| P0 | Fix broken links in viscosity guide | 15 min | HIGH — unblocks best conversion page |
| P0 | Fix empty collection pages | 30 min (theme/liquid) | HIGH — dead-end navigation |
| P1 | Get reviews displaying (product pages + reviews page) | 1-2 hrs | HIGH — 1,183 reviews hidden |
| P1 | Fix refund policy cross-domain link | 5 min | LOW but trust signal |
| P1 | Hide OOS products or add back-in-stock notify | 30 min | MEDIUM — catalog perception |
| P2 | Add "Which glue?" CTA/selector on homepage | 1 hr | MEDIUM — reduces bounce |
| P2 | Create bundle/2-pack to hit free shipping threshold | 1 hr | MEDIUM — AOV boost |
| P2 | Visual product differentiation (color badges, labels) | 2-4 hrs | MEDIUM — reduces choice paralysis |
| P3 | Product page enhancements (comparison, use-case tags) | 4-8 hrs | MEDIUM |
| P3 | Homepage "For Your Craft / For Your Business" split | 2-4 hrs | LOW-MEDIUM |

---

## Contact Page Note
Address shows: `113 Cherry St, 72744, Seattle WA 98104`
- The zip code `72744` is Arkansas, not Seattle. Should be just `98104` for Seattle, or the address is wrong.
- About Us says "Gluemasters of Washington" and B2B says "Made & stocked in Chicago" — which is it? Messaging inconsistency.

## About Us Page
Last modified 2022. Still says "started in 2014" which is fine, but the content feels dated compared to the polished new pages. The Our Story page is much better — consider redirecting About Us → Our Story.
