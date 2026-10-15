# Creators AquaHub

**Mobile Aquarium Companion & Community Ecosystem**  
Under the parent brand **Creators Aquarium** (`https://www.creatorsaquarium.com/`)

---

## Brand Structure
* **Parent Brand & Commercial Website:** Creators Aquarium
* **Mobile Application:** Creators AquaHub (iOS & Android via Expo SDK 57)
* **Community Feed:** The Hub
* **AI Aquarium Assistant:** AquaHub AI

---

## Architectural Stack
* **Client App:** Expo SDK 57 + React Native 0.86 + React 19.2 + Expo Router
* **Design System:** Playfair Display + Plus Jakarta Sans + `#050505` & `#8BCF32`
* **Authoritative Database:** Supabase PostgreSQL with Row Level Security (RLS)
* **Authentication:** Supabase Auth (Email OTP via Resend custom SMTP on `auth.creatorsaquarium.com`, Google, Apple)
* **Media Storage:** Cloudinary via backend-signed direct uploads
* **AI Memory & Orchestration:** Convex Cloud with ES256 Supabase JWKS auth bridge
* **AI Model Adapter:** Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8`) / Groq (`openai/gpt-oss-20b`) / Mock adapter for testing

---

## Financial Policy (Pre-Launch)
* **Pre-Launch Expenditure:** **₹0 / $0**
* Strictly operates on free-tier allowances during development, local testing, alpha, and pre-launch beta.
* Paid services (Supabase Pro, Resend Pro, Cloudinary Plus, Apple Developer Program, Google Play Console) are reviewed and activated only at official commercial launch.

---

## Monorepo Layout
```text
CreatorsAquaHub/
├── apps/
│   └── mobile/              # Expo SDK 57 mobile application
├── packages/
│   ├── design-tokens/       # Official typography, colors, and spacing
│   └── domain/              # Parameter freshness, volume math, dosing engine, Zod schemas
├── supabase/
│   └── migrations/          # PostgreSQL 16 versioned migrations
├── convex/                  # AI threads, memory, and knowledge retrieval
├── .github/workflows/       # Automated CI type-check & lint
├── pnpm-workspace.yaml      # Monorepo workspace configuration
└── package.json
```

---

## Local Development
```bash
# 1. Install dependencies across all packages
pnpm install

# 2. Type-check workspace
pnpm run type-check

# 3. Start Expo mobile development server
pnpm run start
```
