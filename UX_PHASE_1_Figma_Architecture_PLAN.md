# PHASE 1 — COMPLETE FIGMA UX ARCHITECTURE + ENTERPRISE UI/UX SYSTEM (Plan)

## Status
Ready to be implemented as markdown spec inside this repo (to be recreated in Figma).

---

## Information Gathered
- Monorepo contains 5 product surfaces: Customer (web+mobile), Restaurant Dashboard, Delivery Partner, Super Admin, plus Backend APIs.
- Backend/API domains (concept): Auth, Customer, Menu, Orders, Live Tracking, Payments, Subscriptions, Loyalty, Support/Disputes.
- Platform responsibilities per app README.
- No existing UX/Figma/motion/design-system assets currently exist in the repo.

---

## Edit Plan (What will be created in this repo)
We will generate a **Phase-1 UX spec** in markdown so you can map it directly into a Figma file.

### 1) `ux/phase-1/00_overview.md`
- Product UX goals & core principles (your provided philosophy)
- Naming conventions & enterprise UX rules
- Accessibility + performance targets

### 2) `ux/phase-1/01_figma_workspace_structure.md`
- Figma project workspace folders (01–11 exactly as your spec)
- File naming rules
- Pages naming convention (e.g., `001-DesignSystem/Tokens`, `201-ConsumerApp/Flows/...`)

### 3) `ux/phase-1/02_design_system.md` (MANDATORY)
- Color tokens (light + dark)
- Typography (Inter + Poppins + Roboto Mono) + hierarchy (H1/H2/H3/Body/Caption)
- Spacing 8px rule with token names
- Border radius rules
- Shadow system (small/medium/large/premium)
- Token architecture: semantic tokens (e.g., `text-primary`, `bg-surface`)

### 4) `ux/phase-1/03_motion_design_system.md`
- Motion principles (premium, not gimmicky)
- Timing system (Micro 150–200ms, Standard 250–350ms, Page 400–500ms)
- Easing presets and trigger rules
- Motion recipes list:
  - Landing page (hero particles, burger assembling, rider movement, floating 3D cards)
  - Checkout success (food package, rider leaves, confetti)
  - Cart (add-to-cart bounce + floating image → cart)
  - Live tracking (moving bike, ETA smooth transition, pulse effect)
  - Loading skeleton shimmer
  - Reduced motion fallback

### 5) `ux/phase-1/04_customer_journey.md`
- Customer journey 1 (first-time user) with screen mapping
- Additional enterprise journeys:
  - Reorder + saved items
  - Scheduled order
  - Subscription upsell/benefits activation
  - Coupon failure states
  - Support/dispute entry point

### 6) `ux/phase-1/05_customer_app_information_architecture.md`
- Bottom navigation: Home, Search, Orders, Subscription, Profile
- Route mapping rules (action-based navigation)
- Global components inventory (to be reused)

### 7) `ux/phase-1/06_customer_app_screen_architecture.md`
- Full customer screen taxonomy:
  - Auth (12+ screens)
  - Home (15+ screens)
  - Search (10)
  - Menu (20+)
  - Cart (12)
  - Live Tracking (10+)
  - Profile (15)
  - Review flow
- State modeling for each screen: loading/empty/error/offline/reduced-motion

### 8) `ux/phase-1/07_delivery_partner_screen_architecture.md`
- Delivery partner screens (40+)
- Orders flow including accept/reject, GPS navigation, proof of delivery (OTP/photo/signature)
- Earnings, heat map zones, offline/online states

### 9) `ux/phase-1/08_restaurant_dashboard_screen_architecture.md`
- Kitchen-first order workflow screens
- Menu management, variants/pricing, inventory sync
- Analytics/peaks and low-stock alerts

### 10) `ux/phase-1/09_admin_panel_screen_architecture.md`
- Admin dashboard
- Promotions/coupons
- Order/user growth analytics
- Dispute/refund/escalation flows
- Fraud detection audit UI patterns

### 11) `ux/phase-1/10_landing_pages.md`
- Landing Page 1 (Customer conversion)
- Landing Page 2 (Admin/Restaurant internal operations)
- Required sections and motion requirements

### 12) `ux/phase-1/11_component_library_spec.md`
- “10 UI Components” spec with variants:
  - Buttons
  - Cards
  - Modals/Sheets
  - Inputs
  - OTP
  - Toast/Notification
  - Food/Menu cards
  - Map cards
  - Tracking cards
  - Review cards
  - Skeleton/loading templates (included as component variants)
- Each component: states, spacing, token usage, accessibility rules

### 13) `ux/phase-1/12_developer_handoff_checklist.md`
- Design tokens handoff checklist
- Component prop naming conventions
- Screen spec formatting rules
- Pixel-perfect requirements
- Prototype acceptance criteria

### 14) `UX_PHASE_1_TODO.md`
- Progress tracker for the phase work.

---

## Dependent Files to be edited/added
- Add new files under: `ux/phase-1/*`
- Add: `UX_PHASE_1_TODO.md`
- Add: `UX_PHASE_1_Figma_Architecture_PLAN.md`

---

## Followup steps (after markdown spec is created)
- Recreate the spec in Figma:
  - Create tokens + styles + component library
  - Build prototype flows
  - Export Lottie JSON-ready motion guidance
- Run internal QA pass:
  - Dark mode contrast
  - Reduced motion compliance
  - Mobile-first layout checks

---

## Acceptance Criteria
By end of Phase-1:
- 100–150 screen inventory documented (by taxonomy + state modeling)
- Design tokens + semantic token mapping described
- Motion system with timing + recipes described
- Component library spec created
- Clickable prototype flow plan created
- Developer handoff checklist documented

