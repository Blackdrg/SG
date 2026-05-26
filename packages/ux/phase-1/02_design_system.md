# 02 — Design System (Tokens + Styles)

## Token Strategy
- Use **semantic tokens** (preferred) for UI usage.
- Derive semantic tokens from base brand tokens.

### Base Brand Colors (provided)
- Food Orange: `#FF5A1F`
- Dark: `#111827`
- Background: `#F9FAFB`
- White: `#FFFFFF`
- Success: `#10B981`
- Danger: `#EF4444`
- Warning: `#F59E0B`
- Premium Gold: `#D4AF37`

### Semantic Color Tokens (recommended)
Create these semantic tokens in Figma:
- **Background**
  - `bg-primary` (light): Background
  - `bg-surface` (light): White
  - `bg-elevated` (light): slightly tinted surface
- **Text**
  - `text-primary` (light): Dark
  - `text-secondary` (light): neutral gray
  - `text-inverse`: White for dark surfaces
- **Brand / Accent**
  - `brand-primary`: Food Orange
  - `brand-premium`: Premium Gold
- **Status**
  - `status-success`: Success
  - `status-danger`: Danger
  - `status-warning`: Warning

### Dark Mode Semantic Tokens
- Map:
  - `bg-primary` → near-black
  - `bg-surface` → dark surface gray
  - `text-primary` → near-white
  - borders → dark-neutral
- Ensure orange contrast on dark surfaces.

---

## Typography System
Font pairing:
- Headings: **Inter**
- Body: **Poppins**
- Numbers: **Roboto Mono**

### Font Hierarchy
- H1 → **48px**
- H2 → **36px**
- H3 → **28px**
- Body → **16px**
- Caption → **12px**

### Figma Styles
Define Figma text styles:
- `Heading/H1`, `Heading/H2`, `Heading/H3`
- `Body/Regular`, `Body/Medium`, `Body/Semibold`
- `Caption/12`
- `Numbers/Monospace`

Include line-heights and weights (standardize) in Figma.

---

## Spacing System (8px Rule)
Use only 8px multiples:
- 8, 16, 24, 32, 48, 64

Create spacing tokens:
- `S-8`, `S-16`, `S-24`, `S-32`, `S-48`, `S-64`

---

## Border Radius System
- Buttons: 12px
- Cards: 24px
- Inputs: 14px
- Containers: 28px

Create radius styles:
- `R-12`, `R-14`, `R-24`, `R-28`

---

## Shadow System
Define elevation tokens:
- Small / Medium / Large

Also define a **premium floating card** shadow:
- Softer blur
- Slight brand-orange tint (optional, subtle)

Create Figma effects styles:
- `Shadow/Small`
- `Shadow/Medium`
- `Shadow/Large`
- `Shadow/PremiumFloat`

---

## Component Style Rules
- All components must reference tokens (colors/spacing/radii/shadows).
- No hardcoded hex values in components (except base brand token definitions).

