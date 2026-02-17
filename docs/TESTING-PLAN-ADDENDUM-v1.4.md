# GRAVIX AUTOMATED TESTING PLAN — UPDATE ADDENDUM
## Tests for Frontend Update Spec (Landing Page, Nav, Pricing, Auth Gating, New Pages)
### February 2026

**Purpose:** Adds automated tests covering all changes in `gravix-frontend-update-addendum.md`. For anything not mentioned here, the original `gravix-testing-plan.md` remains authoritative. Section numbers continue from Section 27 (the last section of the original plan).

**Conventions:**
- **ADD to Section X** — New tests appended to existing section
- **MODIFY in Section X** — Existing test updated
- **NEW Section X** — Entirely new section

---

# UPDATES TO EXISTING SECTIONS

---

## MODIFY Section 1.1: Test Pyramid (Updated Counts)

```
                    ┌─────────┐
                    │  E2E    │  ~82 tests   (was ~56)
                   ┌┴─────────┴┐
                   │ Integration │  ~176 tests  (was ~150)
                  ┌┴─────────────┴┐
                  │   Unit Tests   │  ~290 tests (was ~258)
                  └────────────────┘
```

| Layer | Count | Runtime | Frequency | What It Catches |
|-------|-------|---------|-----------|-----------------|
| Unit | ~290 | <60s | Every PR | Logic errors in normalizer, classifier, aggregator, context builder, visual classifier, TDS extractor, rate limiter, auth gate, nav gating, form persistence, localStorage handlers |
| Integration | ~176 | ~6min | Every PR | API contract, DB operations, auth flows, middleware, 8D workflow, product specs, rate limiting, seat management, notification delivery |
| E2E | ~82 | ~20min | Nightly + pre-release | Full user flows, 8D investigation flow, guided investigation, product pages, auth gating, landing page conversion flow, pricing page, nav states |
| AI-specific | ~35 | ~8min | Weekly | Prompt quality, visual analysis, TDS extraction, guided orchestrator, pattern detection |
| Performance | ~18 | ~14min | Pre-release | Latency under load, DB query performance, concurrent users, pattern detection cron, product page SSR |

**Delta:** +32 unit, +26 integration, +26 E2E, +3 performance = **+87 tests total → ~601 tests**

---

## MODIFY Section 1.2: Test File Structure (New Files)

ADD these files to the existing tree:

```
tests/
├── unit/
│   ├── ... (existing files unchanged)
│   ├── test_nav_gating.py                # Nav link visibility by plan tier
│   ├── test_form_persistence.py          # localStorage save/restore for auth gate
│   ├── test_usage_counter.py             # Free tier remaining count logic
│   └── test_seat_management.py           # Seat add/remove/limit logic
│
├── integration/
│   ├── ... (existing files unchanged)
│   ├── test_notification_delivery.py     # Notification event → delivery pipeline
│   ├── test_notification_preferences.py  # Per-user preference filtering
│   ├── test_seat_billing.py             # Seat addition → Stripe checkout
│   └── test_org_branding.py             # Custom logo/colors/white-label
│
├── e2e/
│   ├── ... (existing files unchanged)
│   ├── test_landing_page.py              # Hero, features, pricing preview, CTAs
│   ├── test_nav_states.py                # Logged out / logged in / plan-gated links
│   ├── test_pricing_page_v14.py          # 4-tier pricing, correct prices, FAQ
│   ├── test_product_catalog.py           # /products listing, filters, search
│   ├── test_product_performance.py       # /products/[mfr]/[slug] page, SEO, CTAs
│   ├── test_investigation_list.py        # /investigations list + kanban + filters
│   ├── test_investigation_detail.py      # Full investigation page, stepper, sidebar
│   ├── test_guided_investigation.py      # Chat UI, turns, tool calls, pause/resume
│   ├── test_notification_center.py       # Bell dropdown, full page, mark read
│   ├── test_alerts_page.py              # Pattern alerts page, acknowledge flow
│   ├── test_settings_updates.py          # Seats, notifications, branding
│   └── test_form_auth_gate.py           # Form visible → gate on submit → preserve → auto-submit
│
├── performance/
│   ├── ... (existing files unchanged)
│   ├── test_product_page_ssr.py          # Product performance page SSR latency
│   ├── test_investigation_list_load.py   # Investigation list with 100+ items
│   └── test_notification_throughput.py   # Notification delivery at scale
│
└── security/
    ├── ... (existing files unchanged)
    └── test_plan_gating.py               # Feature access enforcement by plan tier
```

---

## ADD to Section 2.1: conftest.py — New Fixtures

```python
# ── Plan-Tier User Fixtures ──

@pytest.fixture
def free_user(supabase):
    """Returns authenticated free-tier user with fresh monthly quota."""
    user = create_test_user(supabase, email="free@test.com", plan="free")
    return user

@pytest.fixture
def pro_user(supabase):
    """Returns authenticated Pro-tier user."""
    user = create_test_user(supabase, email="pro@test.com", plan="pro")
    return user

@pytest.fixture
def quality_user(supabase):
    """Returns authenticated Quality-tier user with org and 3 seats."""
    user = create_test_user(supabase, email="quality@test.com", plan="quality")
    org = create_test_org(supabase, owner=user, seat_limit=3)
    return user, org

@pytest.fixture
def enterprise_user(supabase):
    """Returns authenticated Enterprise-tier user with org and 10 seats."""
    user = create_test_user(supabase, email="enterprise@test.com", plan="enterprise")
    org = create_test_org(supabase, owner=user, seat_limit=10)
    return user, org

# ── Investigation Fixtures ──

@pytest.fixture
def sample_investigation(supabase, quality_user):
    """Returns a Quality-tier investigation with D1-D2 filled, status=Open."""
    user, org = quality_user
    inv = create_test_investigation(supabase, org=org, creator=user,
        title="Test B-pillar disbond", customer="Ford Motor Company",
        severity="critical", template="ford_global_8d")
    return inv

@pytest.fixture
def full_investigation(supabase, enterprise_user):
    """Returns investigation with all D1-D8 complete, ready for closure."""
    user, org = enterprise_user
    inv = create_full_investigation(supabase, org=org, creator=user)
    return inv

# ── Product & TDS Fixtures ──

@pytest.fixture
def seeded_products(supabase):
    """Seeds 15 products with TDS data into product_specifications table."""
    products = seed_tds_products(supabase)
    return products  # list of product records

# ── Notification Fixtures ──

@pytest.fixture
def notification_preferences(supabase, quality_user):
    """Returns user with custom notification preferences set."""
    user, org = quality_user
    prefs = set_notification_preferences(supabase, user, {
        "email_enabled": True,
        "digest_mode": False,
        "quiet_hours_start": "20:00",
        "quiet_hours_end": "07:00",
        "events": {
            "investigation_assigned": {"email": True, "in_app": True},
            "action_assigned": {"email": True, "in_app": True},
            "mentioned": {"email": True, "in_app": True},
            "status_changed": {"email": False, "in_app": True},
        }
    })
    return user, prefs
```

---

## ADD to Section 2.2: factories.py — New Factories

```python
def create_test_org(supabase, owner, seat_limit=3, plan="quality"):
    """Create test organization with owner and seat configuration."""
    return supabase.table("organizations").insert({
        "name": f"Test Org {uuid4().hex[:6]}",
        "owner_id": owner["id"],
        "plan_tier": plan,
        "seat_limit": seat_limit,
        "seats_used": 1,
        "branding": {"logo_url": None, "primary_color": "#1B365D", "hide_gravix": False}
    }).execute().data[0]

def create_test_investigation(supabase, org, creator, **kwargs):
    """Create investigation with sensible defaults."""
    defaults = {
        "org_id": org["id"],
        "creator_id": creator["id"],
        "number": f"GQ-2026-{random.randint(1000,9999)}",
        "title": "Test Investigation",
        "customer": "Test Customer",
        "severity": "major",
        "status": "draft",
        "template": "generic_8d",
    }
    defaults.update(kwargs)
    return supabase.table("investigations").insert(defaults).execute().data[0]

def create_full_investigation(supabase, org, creator):
    """Investigation with all disciplines complete — ready for closure testing."""
    inv = create_test_investigation(supabase, org, creator, status="verification")
    # Fill D1-D8 content, add team members, create action items (all completed)
    fill_all_disciplines(supabase, inv)
    return inv

def seed_tds_products(supabase):
    """Seed product_specifications with top 15 test products."""
    products = [
        {"name": "Loctite 495", "manufacturer": "Henkel", "chemistry": "cyanoacrylate",
         "cure_temp_min": 20, "cure_temp_max": 25, "shear_strength_mpa": 20,
         "substrates": ["metals", "plastics", "rubber"], "primer_required": "SF 770 for polyolefins"},
        {"name": "3M DP460", "manufacturer": "3M", "chemistry": "epoxy",
         "cure_temp_min": 23, "cure_temp_max": 25, "shear_strength_mpa": 31,
         "mix_ratio": "2:1 by volume", "substrates": ["metals", "composites"]},
        {"name": "Loctite 243", "manufacturer": "Henkel", "chemistry": "anaerobic",
         "cure_mechanism": "metal_ion", "substrates": ["metals_only"]},
        # ... (12 more products per TDS-01 through TDS-15 in test datasets)
    ]
    for p in products:
        supabase.table("product_specifications").insert(p).execute()
    return products

def create_test_notification(supabase, user, event_type, investigation=None):
    """Create a test notification for a user."""
    return supabase.table("notifications").insert({
        "user_id": user["id"],
        "event_type": event_type,
        "title": f"Test {event_type} notification",
        "body": "Test notification body",
        "investigation_id": investigation["id"] if investigation else None,
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    }).execute().data[0]
```

---

# NEW SECTIONS

---

# 28. FRONTEND — NAV & LAYOUT TESTS

## 28.1 Nav Link Visibility — Unit Tests (`tests/unit/test_nav_gating.py`)

### ~10 tests

```python
# ── Logged-Out Nav ──

def test_logged_out_nav_shows_public_links():
    """Nav renders: Analyze dropdown, Products, Case Library, Pricing, Sign In, Get Started Free"""

def test_logged_out_nav_hides_protected_links():
    """Nav does NOT render: Dashboard, Investigations, Notifications bell"""

def test_logged_out_nav_analyze_dropdown_items():
    """Analyze dropdown contains: 'Failure Analysis' → /failure, 'Spec Engine' → /tool"""

# ── Logged-In Nav (Free/Pro) ──

def test_free_user_nav_shows_core_links():
    """Nav renders: Analyze, Products, Cases, Dashboard, Notifications bell, User menu"""

def test_free_user_nav_hides_investigations():
    """Investigations link NOT visible for Free/Pro users"""

def test_pro_user_nav_analyze_includes_guided():
    """Analyze dropdown includes: Failure Analysis, Spec Engine, Guided Investigation"""

# ── Logged-In Nav (Quality/Enterprise) ──

def test_quality_user_nav_shows_investigations():
    """Investigations link visible for Quality plan"""

def test_enterprise_user_nav_shows_investigations():
    """Investigations link visible for Enterprise plan"""

# ── Notification Bell ──

def test_notification_bell_shows_unread_count():
    """Bell badge shows count of unread notifications (e.g., '3')"""

def test_notification_bell_zero_hides_badge():
    """Bell has no badge when unread count is 0"""
```

---

## 28.2 Form State Persistence — Unit Tests (`tests/unit/test_form_persistence.py`)

### ~8 tests

```python
# ── localStorage Save ──

def test_failure_form_saves_to_localstorage_on_input():
    """Every input change writes form state to localStorage key 'gravix_pending_analysis'"""

def test_spec_form_saves_to_localstorage_on_input():
    """Spec engine form saves under key 'gravix_pending_spec'"""

def test_localstorage_includes_all_fields():
    """Saved state includes: substrate1, substrate2, description, adhesive_type,
    failure_mode, product_name, photos (as base64 or file refs), all optional fields"""

def test_localstorage_excludes_sensitive_data():
    """Saved state does NOT include auth tokens, user_id, or session data"""

# ── localStorage Restore ──

def test_form_restores_from_localstorage_on_mount():
    """On page load, if 'gravix_pending_analysis' exists, form auto-populates"""

def test_form_auto_submits_after_auth():
    """After auth callback, if pending analysis exists, form submits automatically"""

def test_localstorage_cleared_after_successful_submit():
    """After successful analysis submission, localStorage key is removed"""

def test_localstorage_survives_page_reload():
    """Form data persists across page reload (not cleared by navigation)"""
```

---

## 28.3 Usage Counter & Upgrade Logic — Unit Tests (`tests/unit/test_usage_counter.py`)

### ~8 tests

```python
# ── Counter Display ──

def test_free_tier_shows_remaining_count():
    """Free user sees 'X of 5 analyses remaining this month'"""

def test_pro_tier_hides_remaining_count():
    """Pro user does NOT see usage counter"""

def test_quality_tier_hides_remaining_count():
    """Quality/Enterprise users do NOT see usage counter"""

def test_counter_updates_after_analysis():
    """After running analysis, counter decrements by 1"""

# ── Upgrade Prompts ──

def test_upgrade_banner_shown_after_free_analysis():
    """After free-tier analysis completes, non-blocking upgrade banner appears"""

def test_upgrade_banner_not_shown_for_pro():
    """Pro users do NOT see upgrade banner after analysis"""

def test_upgrade_banner_dismissible():
    """Clicking X on upgrade banner hides it for the session"""

def test_limit_reached_disables_submit():
    """At 0 remaining, submit button disabled with 'Monthly Limit Reached' text"""
```

---

## 28.4 Seat Management — Unit Tests (`tests/unit/test_seat_management.py`)

### ~6 tests

```python
def test_add_seat_increments_seats_used():
    """Adding seat: seats_used 2 → 3, org within limit"""

def test_add_seat_blocked_at_limit():
    """Quality org at 3/3 seats: add seat requires limit increase or upgrade"""

def test_remove_seat_decrements_count():
    """Removing seat: seats_used 3 → 2, user removed from org"""

def test_seat_price_correct_per_tier():
    """Quality extra seat: $79/mo. Enterprise extra seat: $49/mo."""

def test_enterprise_higher_seat_limit():
    """Enterprise base: 10 seats. Quality base: 3 seats."""

def test_seat_user_inherits_org_plan():
    """User added to Quality org gets Quality-tier rate limits and feature access"""
```

---

# 29. FRONTEND — LANDING PAGE & PRICING TESTS

## 29.1 Landing Page E2E (`tests/e2e/test_landing_page.py`)

### ~12 tests (Playwright)

```python
# ── Hero Section ──

async def test_hero_renders_new_copy(page):
    """Hero headline: 'The adhesive intelligence platform for manufacturing quality teams.'
    Subheadline mentions: 'failure analysis', '8D investigation management',
    'cross-case pattern detection'. Two CTAs visible."""

async def test_hero_primary_cta_navigates_to_failure(page):
    """'Analyze a Failure' → /failure"""

async def test_hero_secondary_cta_scrolls_to_solution(page):
    """'See How It Works ↓' smooth-scrolls to solution section"""

# ── Feature Blocks ──

async def test_five_feature_blocks_render(page):
    """Solution section contains 5 feature blocks in order:
    AI Failure Analysis, 8D Investigation Management, Self-Learning Intelligence,
    Pattern Intelligence, Adhesive Specification Engine."""

async def test_8d_feature_block_visible(page):
    """8D block mentions: 'OEM-ready', 'Ford Global 8D', 'audit trail',
    'IATF 16949', 'photo annotation'"""

# ── Differentiator ──

async def test_three_column_differentiator(page):
    """Comparison shows 3 columns: Generic AI, Manual/Templates, Gravix"""

# ── Pricing Preview ──

async def test_pricing_preview_four_cards(page):
    """4 mini-cards: Free ($0), Pro ($79/mo), Quality ($299/mo), Enterprise ($799/mo).
    'See full plan comparison →' links to /pricing."""

async def test_pricing_preview_correct_prices(page):
    """Pro: $79 (not $49). Quality: $299. Enterprise: $799. No stale prices."""

# ── Social Proof ──

async def test_social_proof_bar_mentions_industries(page):
    """Social proof includes 'automotive, aerospace & medical device teams'"""

# ── Problem Section ──

async def test_problem_cards_updated(page):
    """Problem cards include '8D reports in Word templates' and
    'Knowledge trapped in silos' (not old cards about Google/vendors)"""

# ── Final CTA ──

async def test_final_cta_has_demo_button(page):
    """Final CTA section includes 'Book a Demo →' button on desktop"""

async def test_enterprise_social_proof_section(page):
    """Industry icons/badges section exists between differentiator and How It Works"""
```

---

## 29.2 Pricing Page E2E (`tests/e2e/test_pricing_page_v14.py`)

### ~10 tests (Playwright)

```python
async def test_four_pricing_tiers_displayed(page):
    """Navigate to /pricing. 4 cards: Free, Pro, Quality, Enterprise."""

async def test_pro_price_is_79(page):
    """Pro card shows $79/mo, NOT $49"""

async def test_quality_price_is_299(page):
    """Quality card shows $299/mo, 3 seats included, +$79/ea"""

async def test_enterprise_price_is_799(page):
    """Enterprise card shows $799/mo, 10 seats included, +$49/ea"""

async def test_pro_card_highlighted(page):
    """Pro card has accent border and '★ Most Popular' badge"""

async def test_quality_features_include_8d(page):
    """Quality card lists: 8D investigations, Photo annotation, Team comments,
    Audit log, OEM templates"""

async def test_enterprise_features_include_api(page):
    """Enterprise card lists: API access, SSO/SAML, Pattern alerts, White-label"""

async def test_free_shows_account_required(page):
    """Free card notes 'Account required' for analyses"""

async def test_faq_updated_content(page):
    """FAQ includes: 'What's the difference between Pro and Quality?',
    'How do extra seats work?', 'What OEM report templates are available?'"""

async def test_roi_calculator_cta(page):
    """Below pricing cards: ROI callout with 'Book a demo' link"""
```

---

## 29.3 Nav States E2E (`tests/e2e/test_nav_states.py`)

### ~8 tests (Playwright)

```python
async def test_logged_out_nav_links(page):
    """Logged out: Analyze dropdown, Products, Case Library, Pricing, Sign In, Get Started Free"""

async def test_logged_in_free_nav(page):
    """Free user: Analyze, Products, Cases, Dashboard, bell, user menu. No Investigations."""

async def test_logged_in_quality_nav(page):
    """Quality user: all above + Investigations link visible"""

async def test_logged_in_enterprise_nav(page):
    """Enterprise user: all above + Investigations link visible"""

async def test_analyze_dropdown_items(page):
    """Logged in: dropdown has Failure Analysis, Spec Engine, Guided Investigation"""

async def test_notification_bell_clickable(page):
    """Clicking bell opens notification dropdown with recent items"""

async def test_user_menu_items(page):
    """User dropdown: Notifications, Settings, Subscription, Sign Out"""

async def test_mobile_hamburger_groups(page):
    """At 375px: hamburger menu with Analyze section, Explore section, Account section"""
```

---

# 30. FRONTEND — FORM AUTH GATE E2E TESTS

## 30.1 Form Auth Gate Flow (`tests/e2e/test_form_auth_gate.py`)

### ~10 tests (Playwright)

```python
# ── Failure Analysis Form ──

async def test_failure_form_fillable_without_login(page):
    """Navigate to /failure logged out. All fields interactive: substrate, description,
    dropdowns, photo upload. No login wall blocking the form."""

async def test_failure_form_gate_on_submit(page):
    """Fill form → click 'Analyze Failure' → auth modal appears as overlay.
    Form visible behind blurred backdrop."""

async def test_failure_form_preserved_after_signup(page):
    """Fill: Substrate 1='Aluminum', Substrate 2='ABS', Description='Bond failed'.
    Click Analyze → register new account → modal closes → form still has all data →
    analysis auto-submits → results appear."""

async def test_failure_form_preserved_after_signin(page):
    """Same as above but sign in to existing account instead of register."""

async def test_failure_form_preserved_after_page_reload(page):
    """Fill form → reload page → form data still present from localStorage."""

# ── Spec Engine Form ──

async def test_spec_form_gate_on_submit(page):
    """Same auth gating behavior on /tool — form visible, gate on Generate."""

async def test_spec_form_preserved_after_auth(page):
    """Spec form data preserved through auth flow, auto-submits after login."""

# ── Usage Counter ──

async def test_usage_counter_visible_for_free(page):
    """Free user on /failure: sees 'X of 5 analyses remaining this month'"""

async def test_usage_counter_hidden_for_pro(page):
    """Pro user on /failure: no usage counter visible"""

# ── Limit Reached ──

async def test_monthly_limit_blocks_submission(page):
    """Free user at 5/5: submit button disabled, shows 'Monthly Limit Reached',
    upgrade CTA visible. Form data NOT lost."""
```

---

# 31. FRONTEND — NEW PAGES: PRODUCTS

## 31.1 Product Catalog E2E (`tests/e2e/test_product_catalog.py`)

### ~8 tests (Playwright)

```python
async def test_product_catalog_public_access(page):
    """Navigate to /products without login → page loads, no auth wall"""

async def test_product_catalog_lists_products(page):
    """Products grid shows cards with: name, manufacturer, chemistry, application count,
    field failure rate. Sorted by applications descending."""

async def test_product_catalog_filters(page):
    """Filter by chemistry='Cyanoacrylate' → only CA products shown.
    Filter by manufacturer='Henkel' → only Henkel products."""

async def test_product_catalog_search(page):
    """Type 'Loctite' in search → results filter to Loctite products"""

async def test_product_catalog_minimum_threshold(page):
    """Products with <10 documented applications NOT shown in catalog"""

async def test_product_card_links_to_performance(page):
    """Click 'View Performance →' on Loctite 495 card → navigates to
    /products/henkel/loctite-495"""

async def test_product_catalog_responsive(page):
    """At 375px: single column grid. At 768px: 2 columns. At 1024px: 3 columns."""

async def test_product_catalog_seo_metadata(page):
    """Page has: title tag, meta description, OG tags."""
```

---

## 31.2 Product Performance Page E2E (`tests/e2e/test_product_performance.py`)

### ~8 tests (Playwright)

```python
async def test_performance_page_public_access(page):
    """/products/henkel/loctite-495 loads without login"""

async def test_performance_page_specs_section(page):
    """Key Specifications card shows: viscosity, fixture time, cure, shear strength, temp range"""

async def test_performance_page_field_data(page):
    """Field Performance section shows: total applications, failure rate,
    top failure modes ranked, top root causes ranked, common application errors"""

async def test_performance_page_anonymized(page):
    """No company names, facility names, or identifying info in field data"""

async def test_performance_page_cta_drives_signup(page):
    """CTA 'Get AI Failure Analysis →' opens auth modal when logged out,
    navigates to /failure?product=loctite-495 after auth"""

async def test_performance_page_cta_prefills_form(page):
    """When logged in: CTA navigates to /failure with Product Name pre-selected"""

async def test_performance_page_seo_metadata(page):
    """Title: 'Loctite 495 Field Performance & Failure Analysis | Gravix'.
    Has Schema.org Product markup. Has OG tags."""

async def test_performance_page_404_below_threshold(page):
    """Product with <10 applications: /products/x/y returns 404"""
```

---

# 32. FRONTEND — NEW PAGES: INVESTIGATIONS

## 32.1 Investigation List E2E (`tests/e2e/test_investigation_list.py`)

### ~8 tests (Playwright)

```python
async def test_investigation_list_requires_quality_plan(page):
    """Free/Pro user → /investigations shows upgrade prompt, not list"""

async def test_investigation_list_loads(page):
    """Quality user → /investigations shows investigation cards"""

async def test_investigation_list_filters(page):
    """Filter by status='Open' → only open investigations.
    Filter by severity='Critical' → only critical.
    Search 'Ford' → matches customer name."""

async def test_investigation_kanban_view(page):
    """Toggle to Kanban → columns: Open, Containment, Investigating,
    Corrective, Verification, Closed. Cards in correct columns."""

async def test_investigation_create_button(page):
    """'+ New Investigation' → navigates to /investigations/new"""

async def test_investigation_card_click(page):
    """Click investigation card → navigates to /investigations/[id]"""

async def test_investigation_list_shows_overdue(page):
    """Investigation past target closure: overdue indicator visible"""

async def test_investigation_list_shows_action_counts(page):
    """Each card shows: 'Actions: 3 open, 1 overdue'"""
```

---

## 32.2 Investigation Detail E2E (`tests/e2e/test_investigation_detail.py`)

### ~12 tests (Playwright)

```python
# ── Layout ──

async def test_investigation_detail_loads(page):
    """Navigate to /investigations/[id] → sidebar + stepper + content area render"""

async def test_stepper_shows_8_disciplines(page):
    """8 tabs: D1-D8. Completed tabs show checkmark. Active tab highlighted."""

async def test_sidebar_shows_status_and_team(page):
    """Sidebar: status badge, team members with roles, action summary, photo gallery"""

# ── Discipline Navigation ──

async def test_click_discipline_tab_changes_content(page):
    """Click D4 tab → D4 content renders in main area"""

async def test_completed_discipline_shows_content(page):
    """D2 (completed) → shows filled content, not empty form"""

# ── D4 AI Analysis ──

async def test_d4_run_ai_analysis_button(page):
    """Click 'Run AI Analysis' in D4 → loading state → 5-Why chain + Ishikawa renders"""

async def test_d4_ai_output_editable(page):
    """AI-generated 5-Why text is editable. Edit tracked in audit log."""

# ── Comments ──

async def test_comment_panel_visible(page):
    """Comments panel below main content, shows discipline-specific thread"""

async def test_post_comment_appears_in_thread(page):
    """Type comment → submit → comment appears with author and timestamp"""

async def test_at_mention_triggers_notification(page):
    """Type @member → submit → mentioned user receives notification"""

# ── Photos ──

async def test_upload_photo_to_investigation(page):
    """Upload JPEG → thumbnail in gallery → annotation canvas accessible"""

# ── Mobile ──

async def test_investigation_detail_mobile(page):
    """At 375px: sidebar becomes summary bar, stepper becomes horizontal scroll"""
```

---

# 33. FRONTEND — NEW PAGES: GUIDED INVESTIGATION, NOTIFICATIONS, ALERTS

## 33.1 Guided Investigation E2E (`tests/e2e/test_guided_investigation_ui.py`)

### ~8 tests (Playwright)

```python
async def test_guided_mode_toggle_on_failure_page(page):
    """On /failure, mode toggle visible: 'Standard Analysis' | 'Guided Investigation'.
    Clicking Guided switches to chat UI."""

async def test_guided_chat_first_message(page):
    """Guided mode opens with AI message: 'Start by describing what happened...'"""

async def test_guided_user_message_appears(page):
    """Type description → send → user message bubble appears right-aligned"""

async def test_guided_ai_responds_with_question(page):
    """After user message, AI responds with follow-up question + quick-reply buttons"""

async def test_guided_quick_reply_buttons(page):
    """Click quick-reply pill (e.g., 'IPA Wipe') → sends as user message"""

async def test_guided_tool_call_visible(page):
    """When AI calls tool, shows '🔍 Searching similar cases...' indicator"""

async def test_guided_photo_upload_in_chat(page):
    """Click 📎 → upload photo → photo appears in chat → AI references in response"""

async def test_guided_pause_and_resume(page):
    """Click 'Pause & Save' → navigate away → return → conversation restored"""
```

---

## 33.2 Notification Center E2E (`tests/e2e/test_notification_center.py`)

### ~6 tests (Playwright)

```python
async def test_notification_dropdown_opens(page):
    """Click bell → dropdown shows up to 5 recent notifications"""

async def test_notification_unread_highlighted(page):
    """Unread items have accent dot. Read items do not."""

async def test_notification_click_navigates(page):
    """Click notification → navigates to linked resource (investigation, action, alert)"""

async def test_mark_all_read(page):
    """Click 'Mark all read' → all items lose unread indicator. Badge count = 0."""

async def test_notification_full_page(page):
    """'View all notifications →' → /notifications page with filters and pagination"""

async def test_notification_filter_by_type(page):
    """Filter by event type → only matching notifications shown"""
```

---

## 33.3 Pattern Alerts Page E2E (`tests/e2e/test_alerts_page.py`)

### ~4 tests (Playwright)

```python
async def test_alerts_page_requires_enterprise(page):
    """Free/Pro/Quality user → /alerts shows upgrade prompt"""

async def test_alerts_page_lists_alerts(page):
    """Enterprise user → alert cards with severity, title, hypothesis, actions"""

async def test_alert_acknowledge_flow(page):
    """Click 'Acknowledge' → alert status changes → notes field available"""

async def test_alert_filter_by_severity(page):
    """Filter by 'Critical' → only red alerts shown"""
```

---

# 34. FRONTEND — SETTINGS & DASHBOARD UPDATE TESTS

## 34.1 Settings Updates E2E (`tests/e2e/test_settings_updates.py`)

### ~6 tests (Playwright)

```python
async def test_subscription_shows_correct_plan(page):
    """Settings subscription section shows current plan name and price"""

async def test_seat_management_visible_for_quality(page):
    """Quality user sees: 'Seats: X of Y used' + 'Add Seat — $79/mo'"""

async def test_seat_management_hidden_for_pro(page):
    """Pro user does NOT see seat management section"""

async def test_notification_preferences_visible_for_quality(page):
    """Quality user sees: notification toggle, digest mode, quiet hours, per-event settings"""

async def test_org_branding_visible_for_enterprise(page):
    """Enterprise user sees: company name, logo upload, color pickers, white-label toggle"""

async def test_org_branding_hidden_for_quality(page):
    """Quality user does NOT see branding section"""
```

---

## 34.2 Dashboard Updates E2E (`tests/e2e/test_dashboard_updates.py`)

### ~6 tests (Playwright)

```python
async def test_dashboard_quick_actions_free(page):
    """Free user: 3 cards (Failure, Spec, Guided). No Investigation card."""

async def test_dashboard_quick_actions_quality(page):
    """Quality user: 4 cards (Failure, 8D Investigation, Guided, Spec)"""

async def test_dashboard_investigation_summary_quality(page):
    """Quality user: investigations card shows open count, overdue actions, recent items"""

async def test_dashboard_investigation_summary_hidden_free(page):
    """Free/Pro user: investigations card NOT visible"""

async def test_dashboard_alerts_card_enterprise(page):
    """Enterprise user: pattern alerts card shows recent critical/warning alerts"""

async def test_dashboard_alerts_card_hidden_quality(page):
    """Quality user: alerts card NOT visible"""
```

---

# 35. FRONTEND — INTEGRATION TESTS

## 35.1 Notification Delivery (`tests/integration/test_notification_delivery.py`)

### ~10 tests

```python
def test_investigation_created_notifies_org_members(client, quality_user):
    """POST /v1/investigations → all org members get 'investigation_created' notification"""

def test_member_assigned_notifies_assignee(client, quality_user):
    """Assign team member → assignee gets 'member_assigned' notification"""

def test_action_assigned_notifies_owner(client, quality_user):
    """Create action item → owner gets 'action_assigned' notification"""

def test_mention_notifies_mentioned_user(client, quality_user):
    """Post comment with @mention → mentioned user gets notification"""

def test_status_change_notifies_team(client, quality_user):
    """Change investigation status → all team members notified"""

def test_notification_respects_email_preference(client, notification_preferences):
    """If user disabled email for 'status_changed', only in-app notification created"""

def test_digest_mode_batches_notifications(client, notification_preferences):
    """With digest=True, email not sent immediately — queued for digest cron"""

def test_quiet_hours_defers_email(client, notification_preferences):
    """Notification during quiet hours: in-app sent, email deferred to morning"""

def test_mute_investigation_blocks_notifications(client, quality_user):
    """Muted investigation: no notifications except direct @mentions"""

def test_notification_mark_read_endpoint(client, quality_user):
    """POST /v1/notifications/mark-read → updates read=true"""
```

---

## 35.2 Notification Preferences (`tests/integration/test_notification_preferences.py`)

### ~6 tests

```python
def test_get_notification_preferences(client, quality_user):
    """GET /v1/notifications/preferences → returns user's event-level settings"""

def test_update_notification_preferences(client, quality_user):
    """PUT /v1/notifications/preferences → saves new settings"""

def test_default_preferences_on_signup(client):
    """New user: all events email+in-app enabled, digest off, no quiet hours"""

def test_invalid_event_type_rejected(client, quality_user):
    """Preference for nonexistent event type → 400 error"""

def test_preferences_per_user_not_global(client, quality_user):
    """User A's preferences don't affect User B's notification delivery"""

def test_preferences_require_quality_plan(client, free_user):
    """Free/Pro user → GET preferences returns defaults, PUT returns 403"""
```

---

## 35.3 Seat Billing (`tests/integration/test_seat_billing.py`)

### ~6 tests

```python
def test_add_seat_creates_stripe_checkout(client, quality_user):
    """POST /v1/org/seats/add → returns Stripe checkout URL for $79/mo seat"""

def test_add_seat_enterprise_price(client, enterprise_user):
    """Enterprise seat add → Stripe checkout for $49/mo"""

def test_remove_seat_cancels_stripe_subscription_item(client, quality_user):
    """POST /v1/org/seats/remove → cancels seat subscription item in Stripe"""

def test_seat_limit_enforced(client, quality_user):
    """Org at seat limit → add seat requires limit increase (Stripe proration)"""

def test_seat_count_reflects_in_org(client, quality_user):
    """After adding seat: GET /v1/org → seats_used incremented"""

def test_downgrade_blocks_if_over_seat_limit(client, enterprise_user):
    """Enterprise (10 seats) with 8 members → downgrade to Quality (3 seats) blocked
    until seats reduced"""
```

---

## 35.4 Organization Branding (`tests/integration/test_org_branding.py`)

### ~4 tests

```python
def test_upload_logo(client, enterprise_user):
    """POST /v1/org/branding/logo (multipart) → logo stored in Supabase Storage"""

def test_set_brand_colors(client, enterprise_user):
    """PUT /v1/org/branding → saves primary_color, secondary_color"""

def test_white_label_flag(client, enterprise_user):
    """PUT /v1/org/branding with hide_gravix=true → report generation excludes Gravix branding"""

def test_branding_requires_enterprise(client, quality_user):
    """Quality user → PUT /v1/org/branding → 403"""
```

---

# 36. FRONTEND — PERFORMANCE TESTS

## 36.1 Product Page SSR (`tests/performance/test_product_page_ssr.py`)

### ~2 tests

```python
def test_product_catalog_page_load_time():
    """GET /products with 50 products → response <500ms.
    Page renders server-side with full content (not client-only hydration)."""

def test_product_performance_page_load_time():
    """GET /products/henkel/loctite-495 → response <300ms.
    Pre-generated static content, not computed on request."""
```

---

## 36.2 Investigation List Load (`tests/performance/test_investigation_list_load.py`)

### ~1 test

```python
def test_investigation_list_with_100_items():
    """Org with 100 investigations → /investigations loads in <1s.
    Paginated — not all 100 loaded at once."""
```

---

# 37. FRONTEND — SECURITY TESTS

## 37.1 Plan Gating Enforcement (`tests/security/test_plan_gating.py`)

### ~10 tests

```python
# ── Feature Access ──

def test_free_cannot_create_investigation(client, free_user):
    """POST /v1/investigations as free user → 403 with upgrade message"""

def test_pro_cannot_create_investigation(client, pro_user):
    """POST /v1/investigations as Pro user → 403"""

def test_quality_can_create_investigation(client, quality_user):
    """POST /v1/investigations as Quality user → 201"""

def test_free_cannot_access_alerts(client, free_user):
    """GET /v1/intelligence/trends as free user → 403"""

def test_quality_cannot_access_alerts(client, quality_user):
    """GET /v1/intelligence/trends as Quality user → 403"""

def test_enterprise_can_access_alerts(client, enterprise_user):
    """GET /v1/intelligence/trends as Enterprise user → 200"""

# ── Org Isolation ──

def test_user_cannot_see_other_org_investigations(client, quality_user):
    """User in Org A → GET /v1/investigations → sees only Org A investigations"""

def test_user_cannot_access_other_org_investigation(client, quality_user):
    """GET /v1/investigations/[other_org_id] → 404 (not 403, no info leak)"""

# ── Seat Enforcement ──

def test_adding_user_beyond_seat_limit_blocked(client, quality_user):
    """Org at 3/3 seats → POST /v1/org/members → 403 'Seat limit reached'"""

def test_admin_routes_still_blocked_for_non_admin(client, enterprise_user):
    """Enterprise user without admin role → GET /v1/admin → 403"""
```

---

## MODIFY Section 18.2: Updated Test Commands

ADD these commands:

```bash
# Frontend-specific E2E tests
pytest tests/e2e/test_landing_page.py tests/e2e/test_pricing_page_v14.py tests/e2e/test_nav_states.py -v

# Auth gating E2E
pytest tests/e2e/test_form_auth_gate.py -v

# New pages E2E
pytest tests/e2e/test_product_catalog.py tests/e2e/test_product_performance.py tests/e2e/test_investigation_list.py tests/e2e/test_investigation_detail.py -v

# Notification pipeline
pytest tests/integration/test_notification_delivery.py tests/integration/test_notification_preferences.py -v

# Plan gating security
pytest tests/security/test_plan_gating.py -v
```

---

## MODIFY: Updated Coverage Targets

ADD these rows to the coverage table:

| Module | Target |
|--------|--------|
| `services/notification_service.py` | 85% (was 80%) |
| `services/seat_manager.py` | 90% |
| `services/org_branding.py` | 80% |
| `middleware/plan_gate.py` | 95% |
| `utils/form_persistence.py` | 90% |
| `routers/notifications.py` | 85% |
| `routers/org.py` | 85% |
| **Overall** | **84%** (was 82%) |

---

## FINAL TEST COUNT SUMMARY

| Layer | Original | Added | New Total |
|-------|----------|-------|-----------|
| Unit | 258 | 32 | **290** |
| Integration | 150 | 26 | **176** |
| E2E | 56 | 26 | **82** |
| AI-specific | 35 | 0 | **35** |
| Performance | 15 | 3 | **18** |
| Security | — | 10 | **+10 to existing** |
| **TOTAL** | **~514** | **+97** | **~611** |

---

**END OF AUTOMATED TESTING PLAN — UPDATE ADDENDUM**
