/**
 * Synthetic Domain Test Fixtures for Creators AquaHub
 * Conforms strictly to zero-cost, privacy-safe, non-production test data.
 * Zero paid external API calls or user data needed.
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
}

export interface SyntheticStore {
  id: string;
  name: string;
  area: string;
  city: string;
  specialization: string[];
  isVerified: boolean;
  auditDate: string;
  auditMethod: "physical_onsite" | "direct_owner_call";
  contactSummary: string;
  address: string;
}

// 1. Synthetic Tanks
export const SYNTHETIC_TANKS: SyntheticTank[] = [
  {
    id: "tank-planted-01",
    name: "ADA Nature 60P - High Tech",
    tankType: "planted",
    volumeLiters: 64,
    setupDate: "2026-03-15",
    description: "High-tech Iwagumi layout featuring Seiryu stones, Hemianthus callitrichoides 'Cuba' carpet, and pressurized CO2 at 30 ppm.",
    privacy: "public",
    parametersSummary: {
      totalReadings: 5,
      freshCount: 4,
      agingCount: 1,
      staleCount: 0,
      overallFreshness: "fresh",
    },
  },
  {
    id: "tank-reef-02",
    name: "Red Sea Reefer 250 - Mixed Reef",
    tankType: "marine_reef",
    volumeLiters: 204,
    setupDate: "2025-11-20",
    description: "Mixed reef system with Euphyllia garden, Montipora plating corals, pair of Amphiprion ocellaris, and automated 2-part dosing.",
    privacy: "private",
    parametersSummary: {
      totalReadings: 6,
      freshCount: 2,
      agingCount: 3,
      staleCount: 1,
      overallFreshness: "aging",
    },
  },
  {
    id: "tank-biotope-03",
    name: "Rio Negro Blackwater Biotope",
    tankType: "freshwater",
    volumeLiters: 120,
    setupDate: "2025-08-10",
    description: "Botanical-style wild discus & cardinal tetra environment with Catappa leaves, Malaysian driftwood, and RO water conditioned to low TDS.",
    privacy: "unlisted",
    parametersSummary: {
      totalReadings: 3,
      freshCount: 0,
      agingCount: 1,
      staleCount: 2,
      overallFreshness: "stale",
    },
  },
];

// 2. Synthetic Readings for ADA 60P and Red Sea Reefer 250
export const SYNTHETIC_READINGS: SyntheticReading[] = [
  {
    id: "read-01",
    tankId: "tank-planted-01",
    parameterSlug: "ph",
    parameterName: "pH",
    value: 6.6,
    unit: "pH",
    observedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4h ago
    freshness: "fresh",
    testMethod: "device_telemetry",
    testKit: "Digital pH Electrode (Calibrated)",
    idealRange: "6.4 - 6.8",
    status: "in_range",
  },
  {
    id: "read-02",
    tankId: "tank-planted-01",
    parameterSlug: "nitrate",
    parameterName: "Nitrate (NO3)",
    value: 12.0,
    unit: "ppm",
    observedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), // 18h ago
    freshness: "fresh",
    testMethod: "liquid_titration",
    testKit: "Salifert NO3 Test Kit",
    idealRange: "10.0 - 20.0 ppm",
    status: "in_range",
  },
  {
    id: "read-03",
    tankId: "tank-planted-01",
    parameterSlug: "phosphate",
    parameterName: "Phosphate (PO4)",
    value: 0.8,
    unit: "ppm",
    observedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), // 22h ago
    freshness: "fresh",
    testMethod: "lab_photometer",
    testKit: "Hanna Marine/Fresh Checker HI713",
    idealRange: "0.5 - 1.5 ppm",
    status: "in_range",
  },
  {
    id: "read-04",
    tankId: "tank-reef-02",
    parameterSlug: "alkalinity",
    parameterName: "Alkalinity (dKH)",
    value: 8.2,
    unit: "dKH",
    observedAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(), // 52h ago (~2.1 days -> aging in reef)
    freshness: "aging",
    testMethod: "liquid_titration",
    testKit: "Salifert KH/Alk Profi-Test",
    idealRange: "8.0 - 9.0 dKH",
    status: "in_range",
  },
  {
    id: "read-05",
    tankId: "tank-reef-02",
    parameterSlug: "calcium",
    parameterName: "Calcium (Ca)",
    value: 425,
    unit: "ppm",
    observedAt: new Date(Date.now() - 170 * 3600 * 1000).toISOString(), // 170h ago (~7.1 days -> aging in reef)
    freshness: "aging",
    testMethod: "liquid_titration",
    testKit: "Salifert Calcium Profi-Test",
    idealRange: "410 - 440 ppm",
    status: "in_range",
  },
  {
    id: "read-06",
    tankId: "tank-biotope-03",
    parameterSlug: "ph",
    parameterName: "pH",
    value: 5.6,
    unit: "pH",
    observedAt: new Date(Date.now() - 360 * 3600 * 1000).toISOString(), // 15 days ago -> stale
    freshness: "stale",
    testMethod: "liquid_titration",
    testKit: "API Freshwater Master Kit",
    idealRange: "5.5 - 6.5",
    status: "in_range",
  },
];

// 3. Synthetic Community Posts (The Hub)
export const SYNTHETIC_HUB_POSTS: SyntheticHubPost[] = [
  {
    id: "post-01",
    authorName: "Kiran R.",
    authorHandle: "@kiran_aquascapes",
    authorBadge: "Verified Aquascaper",
    title: "Iwagumi 90cm: 6-Month Progression with Monte Carlo & Rotala H'ra",
    summary: "Reflecting on dialing in Twinstar LED intensity and ADA Brighty K dosing. Transitioned from initial diatoms to pristine pearling without algaecides.",
    category: "Showcase",
    likesCount: 42,
    commentsCount: 9,
    publishedAt: "2h ago",
    tankType: "planted",
    tags: ["HighTech", "Iwagumi", "CO2", "MonteCarlo"],
  },
  {
    id: "post-02",
    authorName: "Ananya S.",
    authorHandle: "@reef_bengaluru",
    authorBadge: "Reef Enthusiast",
    title: "Stabilizing dKH Swings in a 200L Nano Mixed Reef",
    summary: "My SPS corals started showing tip burn when alkalinity fluctuated between 7.5 and 9.1 dKH. Here is how splitting dosing into 12 micro-doses resolved stability.",
    category: "Questions",
    likesCount: 28,
    commentsCount: 14,
    publishedAt: "6h ago",
    tankType: "marine_reef",
    tags: ["MarineReef", "Alkalinity", "MicroDosing"],
  },
  {
    id: "post-03",
    authorName: "Deepak Verma",
    authorHandle: "@deepak_wilds",
    authorBadge: "Biotope Specialist",
    title: "Rio Negro Blackwater Journal: Botanicals, Tannins & Low TDS Care",
    summary: "Documenting leaf litter decomposition rates and fungal biofilm development in a 120L low-pH setup for wild paracheirodon simulans.",
    category: "Journals",
    likesCount: 35,
    commentsCount: 6,
    publishedAt: "1d ago",
    tankType: "freshwater",
    tags: ["Blackwater", "Biotope", "Tannins", "WildTetras"],
  },
];

// 4. Synthetic Verified Bengaluru Stores (Permitted & Audited)
export const SYNTHETIC_VERIFIED_STORES: SyntheticStore[] = [
  {
    id: "store-01",
    name: "Creators Aquarium Experience Hub",
    area: "Indiranagar",
    city: "Bengaluru",
    specialization: ["Planted Tanks", "Marine Reef", "Custom Living Glass", "Maintenance"],
    isVerified: true,
    auditDate: "2026-10-01",
    auditMethod: "physical_onsite",
    contactSummary: "Flagship experience gallery • Appointments & bespoke consultations",
    address: "100 Feet Road, Indiranagar, Bengaluru 560038",
  },
  {
    id: "store-02",
    name: "Nature Aqua Design Studio",
    area: "HSR Layout",
    city: "Bengaluru",
    specialization: ["Aquascaping Hardscape", "ADA Certified Goods", "Tissue Culture Plants"],
    isVerified: true,
    auditDate: "2026-09-15",
    auditMethod: "direct_owner_call",
    contactSummary: "Verified partner store • Direct owner confirmed inventory",
    address: "Sector 3, HSR Layout, Bengaluru 560102",
  },
  {
    id: "store-03",
    name: "Coral Bay Reef Sanctuary",
    area: "Whitefield",
    city: "Bengaluru",
    specialization: ["Aquacultured Corals", "Reef Chemistry Testing", "Marine RO/DI"],
    isVerified: true,
    auditDate: "2026-09-28",
    auditMethod: "direct_owner_call",
    contactSummary: "Verified marine specialist • Sustainable captive-propagated frags",
    address: "ITPL Main Road, Whitefield, Bengaluru 560066",
  },
];
