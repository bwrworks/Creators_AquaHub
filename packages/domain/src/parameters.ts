/**
 * Creators AquaHub Parameter Freshness & Measurement Reliability Domain Engine
 */

export type FreshnessState = "fresh" | "aging" | "stale";

export type MeasurementReliability =
  | "lab_photometer"     // Highest precision: digital colorimeter/photometer (e.g., Hanna)
  | "liquid_titration"  // High precision: drop-count titration (e.g., Salifert, Red Sea, API liquid)
  | "test_strip"        // Moderate/low precision: multi-pad dip strip (quick triage only)
  | "device_telemetry"  // Continuous digital sensor (e.g., calibrated pH/temperature probe)
  | "estimate";         // Unverified hobbyist estimate

export type TankWaterCategory = "freshwater" | "planted" | "marine_reef";

export interface ParameterThresholds {
  freshHours: number;
  agingHours: number;
}

/**
 * Provisional Freshness Thresholds (in hours) by Parameter & Water Category.
 * Marked as provisional until domain-expert reviewed against freshwater, planted, and reef care standards.
 */
export const PROVISIONAL_FRESHNESS_MAP: Record<
  string,
  Record<TankWaterCategory, ParameterThresholds>
> = {
  temperature: {
    freshwater: { freshHours: 12, agingHours: 24 },
    planted: { freshHours: 12, agingHours: 24 },
    marine_reef: { freshHours: 12, agingHours: 24 },
  },
  ph: {
    freshwater: { freshHours: 48, agingHours: 168 }, // 2 days fresh, 7 days aging
    planted: { freshHours: 24, agingHours: 48 },    // High-tech CO2 swings daily
    marine_reef: { freshHours: 24, agingHours: 48 },
  },
  ammonia: {
    freshwater: { freshHours: 24, agingHours: 72 },
    planted: { freshHours: 24, agingHours: 72 },
    marine_reef: { freshHours: 24, agingHours: 72 },
  },
  nitrite: {
    freshwater: { freshHours: 24, agingHours: 72 },
    planted: { freshHours: 24, agingHours: 72 },
    marine_reef: { freshHours: 24, agingHours: 72 },
  },
  nitrate: {
    freshwater: { freshHours: 168, agingHours: 336 }, // 7 days fresh, 14 days aging
    planted: { freshHours: 168, agingHours: 336 },
    marine_reef: { freshHours: 168, agingHours: 336 },
  },
  alkalinity: {
    freshwater: { freshHours: 168, agingHours: 336 }, // 7 days fresh
    planted: { freshHours: 168, agingHours: 336 },
    marine_reef: { freshHours: 48, agingHours: 96 },   // Rapid SPS consumption
  },
  salinity: {
    freshwater: { freshHours: 720, agingHours: 1440 },
    planted: { freshHours: 720, agingHours: 1440 },
    marine_reef: { freshHours: 48, agingHours: 96 },   // Evaporation risk
  },
  calcium: {
    freshwater: { freshHours: 336, agingHours: 720 },
    planted: { freshHours: 336, agingHours: 720 },
    marine_reef: { freshHours: 168, agingHours: 336 }, // 7 days fresh, 14 days aging
  },
  magnesium: {
    freshwater: { freshHours: 720, agingHours: 1440 },
    planted: { freshHours: 720, agingHours: 1440 },
    marine_reef: { freshHours: 336, agingHours: 672 }, // 14 days fresh, 28 days aging
  },
  phosphate: {
    freshwater: { freshHours: 168, agingHours: 336 },
    planted: { freshHours: 120, agingHours: 240 },     // 5 days fresh
    marine_reef: { freshHours: 120, agingHours: 240 },
  },
};

/**
 * Calculates the temporal freshness state of a measurement based on its observed timestamp.
 */
export function calculateFreshnessState(
  parameterSlug: string,
  waterCategory: TankWaterCategory,
  observedAt: Date | string,
  referenceDate: Date = new Date()
): FreshnessState {
  const observedTime = typeof observedAt === "string" ? new Date(observedAt).getTime() : observedAt.getTime();
  const diffHours = (referenceDate.getTime() - observedTime) / (1000 * 60 * 60);

  if (diffHours < 0) return "fresh"; // Future or clock-skewed timestamp

  const paramConfig = PROVISIONAL_FRESHNESS_MAP[parameterSlug.toLowerCase()]?.[waterCategory] || {
    freshHours: 168, // Default 7 days
    agingHours: 336, // Default 14 days
  };

  if (diffHours <= paramConfig.freshHours) {
    return "fresh";
  } else if (diffHours <= paramConfig.agingHours) {
    return "aging";
  } else {
    return "stale";
  }
}

/**
 * Returns user-facing guidance on measurement reliability based on test method.
 */
export function getReliabilityGuidance(method: MeasurementReliability): {
  grade: "high" | "moderate" | "low";
  advisory: string;
} {
  switch (method) {
    case "lab_photometer":
      return {
        grade: "high",
        advisory: "Digital photometer: high analytical precision. Suitable for sensitive dosing decisions.",
      };
    case "liquid_titration":
      return {
        grade: "high",
        advisory: "Liquid reagent test: reliable hobbyist benchmark when conducted according to manufacturer steps.",
      };
    case "device_telemetry":
      return {
        grade: "high",
        advisory: "Continuous probe telemetry: verify periodic probe calibration for accuracy.",
      };
    case "test_strip":
      return {
        grade: "moderate",
        advisory: "Multi-pad test strip: useful for rapid triage, but confirm with liquid titration if diagnosing an imbalance.",
      };
    case "estimate":
    default:
      return {
        grade: "low",
        advisory: "Unverified estimate: treat as approximate. Record an actual test kit reading before dosing.",
      };
  }
}
