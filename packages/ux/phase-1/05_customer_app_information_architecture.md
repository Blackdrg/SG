# 05 — Customer App Information Architecture

## Bottom Navigation (Mobile)
- **Home**
- **Search**
- **Orders**
- **Subscription**
- **Profile**

## Global Routing Rules
- All screens must define:
  - primary CTA
  - back behavior
  - deep-link entry point(s)

## Search Model
- Search should always offer:
  - auto-complete
  - recent searches
  - voice search entry
  - filter entry via bottom sheet

## Cart & Checkout Model
- Cart items view must be one-tap accessible from:
  - menu item detail
  - food cards
  - add-ons modal

## Orders Model
- Orders list must support timeline preview:
  - preparing / cooking / picked up / delivered
- Each order detail must provide:
  - contact driver
  - support escalation

