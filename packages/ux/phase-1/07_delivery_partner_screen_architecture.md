# 07 — Delivery Partner Screen Architecture (40+)

## State Modeling
Include loading/empty/error/offline/reduced-motion across all screens.

---

## Core Navigation Screens
1. Orders (queue)
2. Map
3. Earnings
4. Profile

---

## Driver Dashboard (Earnings)
1. Today’s earnings
2. Online/Offline toggle
3. Accepted orders list
4. Heat map zones (availability)
5. Earnings breakdown (week/month)
6. Payout status

---

## Delivery Request Screen
1. Incoming delivery request
2. Accept / Reject
3. Distance + expected earnings
4. Pickup location preview
5. Instructions from restaurant
6. GPS navigation button

---

## Navigation / Tracking
1. GPS navigation (route guidance)
2. In-store waiting state
3. Pickup confirmation (button + time)
4. Moving to customer (screen state)
5. Pulse effect on location
6. ETA live update
7. Contact customer

---

## Proof of Delivery (POD)
1. OTP confirmation
2. Photo upload POD
3. Digital signature POD
4. POD success
5. Failed POD retry

---

## Orders Queue Lifecycle
1. Preparing / restaurant progress
2. Picked up
3. On the way
4. Delivered
5. Cancelled orders with reason

---

## Support & Safety
1. Help / support
2. Dispute entry (if enabled)
3. Call support
4. Emergency safety actions

(Implement remaining screens to reach 40+ by adding:
- error states,
- reconnection screens,
- onboarding screens,
- permission prompts,
- onboarding for proof of delivery).

