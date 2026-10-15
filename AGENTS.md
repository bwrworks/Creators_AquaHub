# Creators AquaHub - Agent Guardrails & Architectural Rules

## Brand Hierarchy & Policy Lock
1. **Parent Brand:** Creators Aquarium (`https://www.creatorsaquarium.com/`) - *Keep untouched and unedited*.
2. **Mobile Application:** Creators AquaHub.
3. **Community:** The Hub.
4. **AI Companion:** AquaHub AI.
5. **Brand Assets:** Strictly reuse exact unaltered assets from `Creators Aquarium/public/brand/`. Never redraw or recolor logos.
6. **Typography & Palette:** Playfair Display for headings, Plus Jakarta Sans for UI/body. Base `#050505`, surface `#101310`, Creators green `#8BCF32` as restrained accent.

## Financial Policy: Absolute ₹0 Pre-Launch Expenditure
- **Zero Paid Subscriptions:** All development, local testing, alpha, and pre-launch beta operate exclusively under free-tier quotas.
- **No Paid AI APIs:** Use free quotas (Cloudflare 10,000 free daily neurons or Groq free developer tier) or synthetic mock generators for automated tests.
- **Quota Throttling:** If any quota (Cloudinary 25 credits, Resend 100/day, Supabase 500MB) is reached, gracefully pause operations and document the free recovery path. Never trigger a paid overage or silent upgrade.
- **No Paid Build Services:** Build and test locally using Android SDK / iOS simulator. Store account registrations ($99 Apple, $25 Google) are launch-day expenses only.

## Data Isolation & Security Rules
- **Supabase PostgreSQL is Authoritative:** Convex stores only AI threads, memory summaries, and retrieval metadata.
- **Strict RLS:** All private entities enforce `owner_id = (select auth.uid())` with default deny.
- **Convex ES256 Auth Bridge:** Convex validates Supabase JWT via asymmetric JWKS (`ES256`). `ctx.auth.getUserIdentity().subject` enforces tenant isolation.
- **No Secrets in Bundles:** Zero Supabase `service_role` keys, Cloudinary secrets, or AI provider keys in client bundles.
- **Deterministic Dosing:** Chemical dosing math is executed exclusively by pure, unit-tested TypeScript functions in `@cah/domain`. Free-form model math is forbidden.
