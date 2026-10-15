/**
 * Synthetic Domain Test Fixtures for Creators AquaHub
 * 
 * STRICT COMPLIANCE:
 * All entries are explicitly labeled as DEMO / SAMPLE DATA.
 * Zero real-world partner claims, zero fabricated audit timestamps,
 * and zero real business addresses.
 */

import { FreshnessState, TankWaterCategory, MeasurementReliability } from "../parameters.js";

export interface SyntheticTank {
  id: string;
  name: string;
  tankType: TankWaterCategory;
  volumeLiters: number;
  setupDate: string;
  description: string;
  privacy: "private" | "unlisted" | "public";
  isDemoData: true;
  parametersSummary: {
    totalReadings: number;
    freshCount: number;
    agingCount: number;
    staleCount: number;
    overallFreshness: FreshnessState;
  };
}

export interface SyntheticReading {
  id: string;
  tankId: string;
  parameterSlug: string;
  parameterName: string;
  value: number;
  unit: string;
  observedAt: string;
  freshness: FreshnessState;
  testMethod: MeasurementReliability;
  testKit?: string;
  idealRange: string;
  status: "in_range" | "warning" | "critical";
  isDemoData: true;
}

export interface SyntheticHubPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorBadge: string;
  title: string;
  summary: string;
  category: "Showcase" | "Questions" | "Journals";
  likesCount: number;
  commentsCount: number;
  publishedAt: string;
  tankType: TankWaterCategory;
  tags: string[];
  isDemoData: true;
}

export interface SyntheticDemoStore {
  id: string;
  name: string;
  area: string;
  city: string;
  specialization: string[];
  isVerified: false;
  isDemoPlaceholder: true;
  contactSummary: string;
  address: string;
  disclaimer: string;
}

// 1. Synthetic Tanks (Explicitly Labeled Demo Fixtures)
export const SYNTHETIC_TANKS: SyntheticTank[] = [
  {
    id: "demo-tank-planted-01",
    name: "[DEMO] ADA Nature 60P - Planted Aquascape",
    tankType: "planted",
    volumeLiters: 64,
    setupDate: "2026-03-15",
    description: "[DEMO FIXTURE] High-tech Iwagumi layout featuring Seiryu stones, Hemianthus callitrichoides 'Cuba' carpet, and pressurized CO2 at 30 ppm.",
    privacy: "public",
    isDemoData: true,
    parametersSummary: {
      totalReadings: 5,
      freshCount: 4,
      agingCount: 1,
      staleCount: 0,
      overallFreshness: "fresh",
    },
  },
  {
    id: "demo-tank-reef-02",
    name: "[DEMO] Red Sea Reefer 250 - Mixed Reef",
    tankType: "marine_reef",
    volumeLiters: 204,
    setupDate: "2025-11-20",
    description: "[DEMO FIXTURE] Mixed reef system with Euphyllia garden, Montipora plating corals, pair of Amphiprion ocellaris, and automated 2-part dosing.",
    privacy: "private",
    isDemoData: true,
    parametersSummary: {
      totalReadings: 6,
      freshCount: 2,
      agingCount: 3,
      staleCount: 1,
      overallFreshness: "aging",
    },
  },
  {
    id: "demo-tank-biotope-03",
    name: "[DEMO] Rio Negro Blackwater Biotope",
    tankType: "freshwater",
    volumeLiters: 120,
    setupDate: "2025-08-10",
    description: "[DEMO FIXTURE] Botanical-style wild discus & cardinal tetra environment with Catappa leaves, Malaysian driftwood, and RO water conditioned to low TDS.",
    privacy: "unlisted",
    isDemoData: true,
    parametersSummary: {
      totalReadings: 3,
      freshCount: 0,
      agingCount: 1,
      staleCount: 2,
      overallFreshness: "stale",
    },
  },
];

// 2. Synthetic Readings (Explicitly Labeled Demo Chemistry Records)
export const SYNTHETIC_READINGS: SyntheticReading[] = [
  {
    id: "demo-read-01",
    tankId: "demo-tank-planted-01",
    parameterSlug: "ph",
    parameterName: "pH",
    value: 6.6,
    unit: "pH",
    observedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    freshness: "fresh",
    testMethod: "device_telemetry",
    testKit: "Digital pH Electrode (Demo)",
    idealRange: "6.4 - 6.8",
    status: "in_range",
    isDemoData: true,
  },
  {
    id: "demo-read-02",
    tankId: "demo-tank-planted-01",
    parameterSlug: "nitrate",
    parameterName: "Nitrate (NO3)",
    value: 12.0,
    unit: "ppm",
    observedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    freshness: "fresh",
    testMethod: "liquid_titration",
    testKit: "Salifert NO3 Kit (Demo)",
    idealRange: "10.0 - 20.0 ppm",
    status: "in_range",
    isDemoData: true,
  },
  {
    id: "demo-read-03",
    tankId: "demo-tank-planted-01",
    parameterSlug: "phosphate",
    parameterName: "Phosphate (PO4)",
    value: 0.8,
    unit: "ppm",
    observedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    freshness: "fresh",
    testMethod: "lab_photometer",
    testKit: "Hanna Marine/Fresh Checker HI713 (Demo)",
    idealRange: "0.5 - 1.5 ppm",
    status: "in_range",
    isDemoData: true,
  },
  {
    id: "demo-read-04",
    tankId: "demo-tank-reef-02",
    parameterSlug: "alkalinity",
    parameterName: "Alkalinity (dKH)",
    value: 8.2,
    unit: "dKH",
    observedAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    freshness: "aging",
    testMethod: "liquid_titration",
    testKit: "Salifert KH/Alk Kit (Demo)",
    idealRange: "8.0 - 9.0 dKH",
    status: "in_range",
    isDemoData: true,
  },
  {
    id: "demo-read-05",
    tankId: "demo-tank-reef-02",
    parameterSlug: "calcium",
    parameterName: "Calcium (Ca)",
    value: 425,
    unit: "ppm",
    observedAt: new Date(Date.now() - 170 * 3600 * 1000).toISOString(),
    freshness: "aging",
    testMethod: "liquid_titration",
    testKit: "Salifert Calcium Kit (Demo)",
    idealRange: "410 - 440 ppm",
    status: "in_range",
    isDemoData: true,
  },
  {
    id: "demo-read-06",
    tankId: "demo-tank-biotope-03",
    parameterSlug: "ph",
    parameterName: "pH",
    value: 5.6,
    unit: "pH",
    observedAt: new Date(Date.now() - 360 * 3600 * 1000).toISOString(),
    freshness: "stale",
    testMethod: "liquid_titration",
    testKit: "Freshwater Master Kit (Demo)",
    idealRange: "5.5 - 6.5",
    status: "in_range",
    isDemoData: true,
  },
];

// 3. Synthetic Community Posts (Explicitly Labeled Demo UGC)
export const SYNTHETIC_HUB_POSTS: SyntheticHubPost[] = [
  {
    id: "demo-post-01",
    authorName: "[Demo User] Kiran R.",
    authorHandle: "@demo_kiran",
    authorBadge: "Demo User (Sample)",
    title: "[DEMO] Iwagumi 90cm: 6-Month Progression with Monte Carlo & Rotala H'ra",
    summary: "[SAMPLE UGC FOR PREVIEW] Reflecting on dialing in Twinstar LED intensity and ADA Brighty K dosing. Transitioned from initial diatoms to pristine pearling without algaecides.",
    category: "Showcase",
    likesCount: 14,
    commentsCount: 3,
    publishedAt: "2h ago",
    tankType: "planted",
    tags: ["DemoData", "HighTech", "Iwagumi", "CO2"],
    isDemoData: true,
  },
  {
    id: "demo-post-02",
    authorName: "[Demo User] Ananya S.",
    authorHandle: "@demo_ananya",
    authorBadge: "Demo User (Sample)",
    title: "[DEMO] Stabilizing dKH Swings in a 200L Nano Mixed Reef",
    summary: "[SAMPLE UGC FOR PREVIEW] SPS corals showed tip burn when alkalinity fluctuated between 7.5 and 9.1 dKH. Splitting automated dosing into 12 micro-doses resolved stability.",
    category: "Questions",
    likesCount: 9,
    commentsCount: 5,
    publishedAt: "6h ago",
    tankType: "marine_reef",
    tags: ["DemoData", "MarineReef", "Alkalinity"],
    isDemoData: true,
  },
  {
    id: "demo-post-03",
    authorName: "[Demo User] Deepak V.",
    authorHandle: "@demo_deepak",
    authorBadge: "Demo User (Sample)",
    title: "[DEMO] Rio Negro Blackwater Journal: Botanicals & Tannin Care",
    summary: "[SAMPLE UGC FOR PREVIEW] Documenting leaf litter decomposition rates and fungal biofilm development in a 120L low-pH setup for wild paracheirodon simulans.",
    category: "Journals",
    likesCount: 11,
    commentsCount: 2,
    publishedAt: "1d ago",
    tankType: "freshwater",
    tags: ["DemoData", "Blackwater", "Biotope", "Tannins"],
    isDemoData: true,
  },
];

// 4. Synthetic Demo Stores (Sanitized: No false verification, no fabricated audits, no real addresses)
export const SYNTHETIC_DEMO_STORES: SyntheticDemoStore[] = [
  {
    id: "demo-store-01",
    name: "Demo Aquatics Studio (Sample Placeholder)",
    area: "Indiranagar (Demo Area)",
    city: "Bengaluru",
    specialization: ["Planted Aquascaping", "Tissue Culture (Sample)"],
    isVerified: false,
    isDemoPlaceholder: true,
    contactSummary: "Mock placeholder listing for layout testing. Not a real business or partner.",
    address: "100 Demo Boulevard, Indiranagar, Bengaluru (Placeholder Address)",
    disclaimer: "Sample mock fixture for UI layout testing. Not a genuine partner or verified business.",
  },
  {
    id: "demo-store-02",
    name: "Demo Reef Sanctuary (Sample Placeholder)",
    area: "HSR Layout (Demo Area)",
    city: "Bengaluru",
    specialization: ["Marine Corals", "Reef Testing (Sample)"],
    isVerified: false,
    isDemoPlaceholder: true,
    contactSummary: "Mock placeholder listing for layout testing. Not a real business or partner.",
    address: "200 Sample Main Road, HSR Layout, Bengaluru (Placeholder Address)",
    disclaimer: "Sample mock fixture for UI layout testing. Not a genuine partner or verified business.",
  },
  {
    id: "demo-store-03",
    name: "Demo Nature Biotopes (Sample Placeholder)",
    area: "Whitefield (Demo Area)",
    city: "Bengaluru",
    specialization: ["Hardscape", "Driftwood & Botanicals (Sample)"],
    isVerified: false,
    isDemoPlaceholder: true,
    contactSummary: "Mock placeholder listing for layout testing. Not a real business or partner.",
    address: "300 Test Road, Whitefield, Bengaluru (Placeholder Address)",
    disclaimer: "Sample mock fixture for UI layout testing. Not a genuine partner or verified business.",
  },
];

// Deprecated alias for backwards-compatibility during migration
export const SYNTHETIC_VERIFIED_STORES = SYNTHETIC_DEMO_STORES;
