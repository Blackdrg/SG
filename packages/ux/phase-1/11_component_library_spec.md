# 11 — Figma Component Library Spec

## Mandatory Component Types (10+)
1. Buttons
2. Cards
3. Modals
4. Search
5. Inputs
6. OTP
7. Food cards
8. Menu cards
9. Map cards
10. Tracking cards
11. Review cards
12. Charts/Tables (for web dashboards)
13. Notification cards
14. Skeleton/loading templates

---

## Component Spec Template (apply to all)
For each component define:
- Variants (primary/secondary/etc.)
- Sizes (sm/md/lg)
- States (default/hover/pressed/disabled/loading)
- Token usage (colors/spacing/radius/shadow)
- Accessibility notes (labels, contrast)

---

## 1) Buttons
Variants:
- Primary (brand orange)
- Secondary
- Ghost
- Destructive (danger)
- Loading

Radii: 12px

---

## 2) Cards
Variants:
- Default card (radius 24)
- Premium floating card (premium shadow)
- List card
- Skeleton card

---

## 3) Modals / Sheets
Variants:
- Confirmation modal
- Address picker sheet
- Filters bottom sheet

Rules:
- default scrim opacity consistent
- close behavior (tap outside / X / swipe for mobile)

---

## 4) Inputs
Variants:
- Text input
- Search input
- OTP input group
- Dropdown
- Stepper quantity

Radius: 14px

---

## 5) OTP Component
Variants:
- 4-digit
- 6-digit
States:
- auto-detect enabled
- resend countdown
- error state

---

## 6) Toast / Notification
Variants:
- success toast
- error toast
- inline alert

Duration:
- Micro/Standard based; ensure non-blocking.

---

## 7) Food Cards
Includes:
- image
- title
- price
- rating
- offer badge
- veg/non-veg + spice (optional)

---

## 8) Menu Cards
Variants:
- Menu section card
- Food item card
- Combo card

---

## 9) Map Cards
Includes:
- ETA pill
- rider marker summary
- timeline progress card

---

## 10) Tracking Cards
Variants:
- Status timeline card
- Contact driver CTA
- Support escalation card

---

## 11) Review Cards
Variants:
- rating selector
- photo upload tile
- text review field

---

## 12) Skeleton Templates
- Product list skeleton
- Menu list skeleton
- Checkout section skeleton
- Tracking skeleton

Skeleton shimmer should follow motion timing system.

