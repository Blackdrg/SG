# 00 — Overview (UX Philosophy + Enterprise Rules)

## Product UX Goals
- **Fast Ordering**: user can place an order in **< 30 seconds**.
- **Minimal Friction**: reduce taps/clicks; favor action-based navigation.
- **Real-Time Feedback**: every action shows immediate response (cart animations, loading skeletons, live status indicators).
- **Mobile-First**: assume 90%+ traffic on mobile.
- **Accessibility**: dark mode, larger fonts, voice search, screen reader support.

## Core UX Principles (Enterprise)
1. **One screen, one primary job**
2. **Predictable navigation**
3. **Action confirmation within 150–350ms**
4. **Graceful failure**
   - offline state messaging
   - retry actions always visible
5. **State completeness**
   - loading, empty, error, success, offline, reduced motion

## Feedback & Micro-Interaction Standards
- Cart additions must provide a visual transfer to cart (micro animation).
- Long operations must show skeletons rather than spinners.
- Live tracking must show timeline progression + ETA smooth transition.

## Accessibility Standards
- **Dark mode** with semantic tokens (no hardcoded colors in components).
- Font scaling:
  - use rem/relative sizing strategy in implementation
  - Figma must model larger type variants.
- Reduced motion:
  - if user prefers reduced motion, remove parallax/3D motion and replace with fades.
- Screen readers (web):
  - ensure meaningful labels for buttons/inputs
  - avoid icon-only buttons without accessible names.

## Performance Targets (UX-level)
- Avoid multi-step forms where a single step can work.
- Use optimistic UI for:
  - add to cart
  - applying coupon
  - selecting address

## Deliverables Boundaries
- This Phase-1 spec defines what to build in Figma:
  - tokens, components, motion recipes, user journeys, and screen inventory.
- Backend and API integration UX hooks are documented at handoff level (placeholders for implementation).

