# 03 — Motion Design System (Premium + Lottie)

## Motion Goals
- Premium, Apple-like continuity.
- No gimmicks.
- Motion must communicate state changes.

## Timing System (provided)
- **Micro**: 150–200ms
- **Standard**: 250–350ms
- **Page transitions**: 400–500ms

## Easing Presets (recommended)
- `ease-out-soft` for confirmations
- `ease-in-out` for transitions
- `spring-smooth` for add-to-cart bounce (subtle)

## Reduced Motion
- If reduced motion is enabled:
  - replace transforms with fade
  - remove parallax/3D and flying elements
  - keep status text changes

---

## Motion Recipes

### Landing Page Animations
1. **Hero Animation**
   - floating food particles
   - duration: Standard
   - loop: light loop (non-distracting)

2. **Burger Assembling Animation**
   - segmented layer assemble
   - trigger: on scroll or load

3. **Delivery Rider Movement**
   - rider glide path
   - end state: idle (subtle)

4. **3D Floating Cards**
   - rotate + translate
   - ensure perspective is subtle

### Checkout Animation
1. **Order Success**
   - food package animation
   - rider leaves
   - confetti effect
   - output: **Lottie JSON export spec** (layer-by-layer guidance)

### App Motion
1. **Cart**
   - add-to-cart bounce
   - floating image → cart
   - timings: Micro for bounce, Standard for transfer

2. **Tracking Screen**
   - moving bike animation
   - pulse effect on location
   - ETA smooth transition
   - timeline transitions must be continuous (no jump cuts)

3. **Loading**
   - skeleton shimmer
   - minimal loaders (avoid spinner overload)

---

## Handoff Spec for Motion Assets (Figma)
For each recipe include:
- Trigger (tap / page open / scroll)
- Duration + easing
- Start state/end state
- Accessibility fallback
- Implementation notes (Lottie JSON or native)

