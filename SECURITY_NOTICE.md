# Security & Production Readiness Notice

**⚠️ CRITICAL: Read before production deployment**

Last updated: 2026-05-30

---

## Critical Security Issues (Must Fix Before User Onboarding)

### JWT Secret Vulnerability
- **Issue**: `JWT_SECRET` was hardcoded as `secret-key-change-in-production` in `.env.example`
- **Impact**: Full session compromise if used in production
- **Status**: ✅ FIXED - Updated to secure placeholder format
- **Action Required**: Generate new random secret with `openssl rand -base64 32` before production

### Payment Processing (Zero Live Revenue)
| Gateway | Status | Keys Needed |
|---------|--------|------------|
| Stripe | ❌ Placeholder only | `sk_live_*` and `whsec_live_*` |
| Razorpay | ❌ Placeholder only | `rzp_live_*` and key secret |

### Push Notifications
| Platform | Status | Keys Needed |
|----------|--------|------------|
| FCM (Android) | ❌ Placeholder | `FCM_SERVER_KEY` from Firebase |
| APNs (iOS) | ❌ Not configured | Key from Apple Developer Portal |

---

## Critical Dependencies (Blocking iOS Launch)

### APNs Configuration Required
- Missing: `APNS_PRIVATE_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID`
- Impact: iOS users will not receive push notifications
- Status: ✅ Implementation exists in code, needs production credentials

---

## Scalability Gap (40x Difference)

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Concurrent Users | ~500 | 20,000 | 40x |

**Testing Status**:
- `fake-orders.js`: Designed for 10 alpha testers
- `breaking-point.js`: Tests up to 50 concurrent users
- k6 load tests (10K/20K): Scripts exist but not configured

**Next Steps**:
1. Run breaking-point tests with infrastructure up
2. Document actual breaking point
3. Implement k6 scripts for higher load testing

---

## Disaster Recovery (40% Complete)

| Component | Status | Notes |
|-----------|--------|-------|
| Backup scripts | ✅ Exist | PostgreSQL, MongoDB, Redis backup implemented |
| DR validation | ❌ Not tested | RTO/RPO targets unknown |
| Velero | ❌ Planned | K8s backup solution not deployed |

**Actions**:
- Run `bash infra/scripts/backup.sh` to verify backup works
- Test `bash infra/scripts/disaster-recovery.sh --production` in staging

---

## Missing Integrations (Medium Priority)

| Service | Purpose | Status |
|---------|---------|--------|
| Google Maps | Customer routing/ETA | ❌ API key placeholder |
| SendGrid | Transactional emails | ❌ API key placeholder |
| Slack webhooks | Alert routing | ❌ Placeholder URL |
| PagerDuty | On-call alerts | ❌ Not configured |

---

## Frontend Gaps

| Area | Status | Notes |
|------|--------|-------|
| UI component tests | ❌ Missing | No Storybook/Chromatic coverage |
| Web pages | ❌ Incomplete | Search, menu, checkout pages missing |

---

## Quick Verification Commands

```bash
# Check for placeholder values in .env
grep -r "CHANGE_ME\|placeholder" .env

# Verify breaking-point tests
node infra/scripts/breaking-point.js

# Run security tests
node infra/scripts/security-tests.js

# Create backup
bash infra/scripts/backup.sh
```

---

## Deployment Checklist

- [ ] Generate and set new JWT/ENCRYPTION secrets
- [ ] Add Stripe live keys (payments)
- [ ] Add FCM server key (push notifications)
- [ ] Add APNs credentials (iOS push)
- [ ] Add Razorpay live keys (INR payments)
- [ ] Add SendGrid API key (emails)
- [ ] Add Google Maps API key (routing)
- [ ] Add Twilio credentials (SMS/OTP)
- [ ] Configure Slack/PagerDuty webhooks
- [ ] Run and document breaking-point test results
- [ ] Validate backup/restore procedures