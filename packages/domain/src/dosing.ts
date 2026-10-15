/**
 * Creators AquaHub Deterministic Dosing Engine
 * 
 * ARCHITECTURAL SAFETY GUARANTEES:
 * 1. Zero Free-Form Model Hallucination: Mathematical calculations run only in pure TypeScript.
 * 2. Reviewed Specification Requirement: Specifications must have reviewStatus: "reviewed".
 * 3. Daily Shift Limit Mandatory: Never defaults a missing max daily shift to the entire target change.
 * 4. Pre-Launch Guardrail: Real chemical dosing recommendations remain disabled (REAL_DOSING_CALCULATIONS_ENABLED = false)
 *    until formal review of product metadata is completed. Pure mathematical simulations are permitted for testing.
 */

import { FreshnessState } from "./parameters.js";

export const REAL_DOSING_CALCULATIONS_ENABLED = false;

export interface ProductDosingSpec {
  productId: string;
  productName: string;
  manufacturer: string;
  targetParameterSlug: string;
  reviewStatus: "reviewed" | "draft" | "retired";
  /** Amount of product needed to raise standard volume by parameterDelta (e.g. 5ml raises 100L by 1 dKH) */
  standardConcentrationRate: {
    productAmount: number;
    productUnit: "ml" | "gram" | "drop" | "tsp" | "cap";
    targetWaterVolumeLitres: number;
    parameterDelta: number;
    parameterUnit: string;
  };
  /** Mandatory reviewed maximum recommended daily parameter shift from manufacturer/veterinary review */
  maxDailyShift: number;
  instructions: string;
}

export interface DosingCalculationInput {
  netWaterVolumeLitres: number;
  currentReading: {
    value: number;
    unit: string;
    freshness: FreshnessState;
  };
  targetValue: number;
  productSpec: ProductDosingSpec;
}

export interface DosingExecutionOptions {
  /** Explicitly enables pure simulation calculation for unit testing without live dispensing */
  allowSimulation?: boolean;
}

export interface DosingCalculationResult {
  isSafe: boolean;
  canDispense: boolean;
  status: "CALCULATED_SIMULATION" | "DISABLED_PRE_LAUNCH" | "SAFETY_ABSTENTION";
  totalRequiredProductAmount: number | null;
  recommendedDailyProductAmount: number | null;
  productUnit: string;
  parameterShiftTotal: number;
  numberOfDaysToTarget: number | null;
  notes: string[];
}

export class DosingValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "DosingValidationError";
  }
}

/**
 * Executes a deterministic dosing calculation with strict safety validations.
 * Refuses to return numeric dosage if any safety prerequisite is absent.
 */
export function calculateDosing(
  input: DosingCalculationInput,
  options: DosingExecutionOptions = {}
): DosingCalculationResult {
  const { netWaterVolumeLitres, currentReading, targetValue, productSpec } = input;
  const spec = productSpec.standardConcentrationRate;

  // Pre-Launch Safety Lock: Real dispensing recommendations are disabled pending biochemical review.
  if (!options.allowSimulation && !REAL_DOSING_CALCULATIONS_ENABLED) {
    const shift = Number((targetValue - currentReading.value).toFixed(2));
    return {
      isSafe: false,
      canDispense: false,
      status: "DISABLED_PRE_LAUNCH",
      totalRequiredProductAmount: null,
      recommendedDailyProductAmount: null,
      productUnit: spec.productUnit,
      parameterShiftTotal: shift > 0 ? shift : 0,
      numberOfDaysToTarget: null,
      notes: [
        "Real chemical dosing recommendations are disabled pre-launch pending biochemist review of chemical metadata.",
        "Always verify water chemistry using laboratory photometers or liquid titration before manually adjusting parameters.",
      ],
    };
  }

  // Prerequisite 1: Volume Validation and Bounds Check (1L to 50,000L)
  if (!netWaterVolumeLitres || netWaterVolumeLitres < 1 || netWaterVolumeLitres > 50000 || !Number.isFinite(netWaterVolumeLitres)) {
    throw new DosingValidationError(
      "INVALID_VOLUME",
      `Valid net aquarium water volume between 1L and 50,000L is required (got: ${netWaterVolumeLitres}).`
    );
  }

  // Prerequisite 2: Freshness Verification (Reject Stale)
  if (currentReading.freshness === "stale") {
    throw new DosingValidationError(
      "STALE_READING",
      `The latest ${productSpec.targetParameterSlug} reading is STALE. Test current water chemistry before calculating a chemical dose.`
    );
  }

  // Prerequisite 3: Parameter Unit Matching
  if (currentReading.unit.trim().toLowerCase() !== spec.parameterUnit.trim().toLowerCase()) {
    throw new DosingValidationError(
      "UNIT_MISMATCH",
      `Unit mismatch: reading unit '${currentReading.unit}' does not match product specification unit '${spec.parameterUnit}'.`
    );
  }

  // Prerequisite 4: Target Value and Shift Sanity
  if (!Number.isFinite(currentReading.value) || currentReading.value < 0) {
    throw new DosingValidationError(
      "INVALID_READING_VALUE",
      `Current measurement value must be a non-negative finite number (got: ${currentReading.value}).`
    );
  }

  const parameterShiftTotal = targetValue - currentReading.value;
  if (parameterShiftTotal <= 0) {
    throw new DosingValidationError(
      "INVALID_TARGET",
      `Current value (${currentReading.value}) is already at or above target (${targetValue}). No additive dosing required.`
    );
  }

  if (parameterShiftTotal > 100) {
    throw new DosingValidationError(
      "EXCESSIVE_SHIFT",
      `Target parameter shift of +${parameterShiftTotal.toFixed(2)} exceeds maximum safe single-cycle shift bounds.`
    );
  }

  // Prerequisite 5: Specification Review Status
  if (productSpec.reviewStatus !== "reviewed") {
    throw new DosingValidationError(
      "UNREVIEWED_PRODUCT_SPEC",
      `Product dosing specification for '${productSpec.productName}' has reviewStatus '${productSpec.reviewStatus}'. Must be 'reviewed' before calculating dosage.`
    );
  }

  // Prerequisite 6: Mandatory Reviewed Maximum Daily Parameter Shift (NEVER default to entire shift)
  if (!productSpec.maxDailyShift || productSpec.maxDailyShift <= 0 || !Number.isFinite(productSpec.maxDailyShift)) {
    throw new DosingValidationError(
      "MISSING_MAX_DAILY_SHIFT",
      "Maximum daily parameter shift must be explicitly defined as a positive finite number. Defaulting to target change is strictly prohibited."
    );
  }

  // Prerequisite 7: Concentration specification validity
  if (spec.productAmount <= 0 || spec.targetWaterVolumeLitres <= 0 || spec.parameterDelta <= 0) {
    throw new DosingValidationError(
      "INVALID_PRODUCT_SPEC",
      "Product dosing concentration specification has non-positive parameters."
    );
  }

  // Mathematical Calculation
  const productPerLitrePerUnit = spec.productAmount / (spec.targetWaterVolumeLitres * spec.parameterDelta);
  const totalRequiredProductAmount = productPerLitrePerUnit * netWaterVolumeLitres * parameterShiftTotal;

  // Safe daily pacing using manufacturer reviewed max daily shift limit
  const numberOfDaysToTarget = Math.max(1, Math.ceil(parameterShiftTotal / productSpec.maxDailyShift));
  const recommendedDailyProductAmount = totalRequiredProductAmount / numberOfDaysToTarget;

  const notes: string[] = [
    `Simulation calculation for net volume of ${Math.round(netWaterVolumeLitres)}L.`,
    `Total target shift: +${parameterShiftTotal.toFixed(2)} ${spec.parameterUnit} paced over ${numberOfDaysToTarget} day(s).`,
  ];

  if (numberOfDaysToTarget > 1) {
    notes.push(
      `Paced at max +${productSpec.maxDailyShift} ${spec.parameterUnit}/day to prevent osmotic or chemical shock to livestock.`
    );
  }

  return {
    isSafe: true,
    canDispense: false, // Remains false pre-launch
    status: "CALCULATED_SIMULATION",
    totalRequiredProductAmount: Number(totalRequiredProductAmount.toFixed(2)),
    recommendedDailyProductAmount: Number(recommendedDailyProductAmount.toFixed(2)),
    productUnit: spec.productUnit,
    parameterShiftTotal: Number(parameterShiftTotal.toFixed(2)),
    numberOfDaysToTarget,
    notes,
  };
}
