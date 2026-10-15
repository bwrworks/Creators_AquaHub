/**
 * Creators AquaHub Deterministic Dosing Engine
 * All calculations are executed strictly by deterministic, unit-tested pure code.
 * Zero free-form model hallucination.
 */

import { FreshnessState } from "./parameters.js";

export interface ProductDosingSpec {
  productId: string;
  productName: string;
  manufacturer: string;
  targetParameterSlug: string;
  /** Amount of product needed to raise 100 Litres by 1 unit (e.g. 5ml raises 100L by 1 dKH) */
  standardConcentrationRate: {
    productAmount: number;
    productUnit: "ml" | "gram" | "drop" | "tsp" | "cap";
    targetWaterVolumeLitres: number;
    parameterDelta: number;
    parameterUnit: string;
  };
  /** Reviewed maximum recommended daily shift from manufacturer specification */
  maxDailyShift?: number;
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

export interface DosingCalculationResult {
  isSafe: boolean;
  totalRequiredProductAmount: number;
  recommendedDailyProductAmount: number;
  productUnit: string;
  parameterShiftTotal: number;
  numberOfDaysToTarget: number;
  notes: string[];
}

export class DosingValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "DosingValidationError";
  }
}

/**
 * Executes a deterministic dosing calculation.
 * Strictly rejects missing, incompatible, or stale inputs.
 */
export function calculateDosing(input: DosingCalculationInput): DosingCalculationResult {
  const { netWaterVolumeLitres, currentReading, targetValue, productSpec } = input;

  // Validation 1: Water Volume
  if (!netWaterVolumeLitres || netWaterVolumeLitres <= 0) {
    throw new DosingValidationError(
      "MISSING_VOLUME",
      "Valid net aquarium water volume is strictly required before calculating chemical dosage."
    );
  }

  // Validation 2: Stale Reading Rejection
  if (currentReading.freshness === "stale") {
    throw new DosingValidationError(
      "STALE_READING",
      `The latest ${productSpec.targetParameterSlug} reading is STALE. Test current water chemistry before calculating a chemical dose.`
    );
  }

  // Validation 3: Target compatibility
  const parameterShiftTotal = targetValue - currentReading.value;
  if (parameterShiftTotal <= 0) {
    throw new DosingValidationError(
      "INVALID_TARGET",
      `Current value (${currentReading.value}) is already at or above target (${targetValue}). No additive dosing required.`
    );
  }

  // Validation 4: Product specification validity
  const spec = productSpec.standardConcentrationRate;
  if (
    spec.productAmount <= 0 ||
    spec.targetWaterVolumeLitres <= 0 ||
    spec.parameterDelta <= 0
  ) {
    throw new DosingValidationError(
      "INVALID_PRODUCT_SPEC",
      "Product dosing concentration specification is invalid or unreviewed."
    );
  }

  // Core Math:
  // Product needed per 1 litre per 1 unit shift = spec.productAmount / (spec.targetWaterVolumeLitres * spec.parameterDelta)
  const productPerLitrePerUnit =
    spec.productAmount / (spec.targetWaterVolumeLitres * spec.parameterDelta);

  const totalRequiredProductAmount =
    productPerLitrePerUnit * netWaterVolumeLitres * parameterShiftTotal;

  // Safe daily pacing using manufacturer reviewed max daily shift (or default single-day if shift is small)
  const maxShiftPerDay = productSpec.maxDailyShift ?? parameterShiftTotal;
  const numberOfDaysToTarget = Math.max(1, Math.ceil(parameterShiftTotal / maxShiftPerDay));
  const recommendedDailyProductAmount = totalRequiredProductAmount / numberOfDaysToTarget;

  const notes: string[] = [
    `Calculated for net volume of ${Math.round(netWaterVolumeLitres)}L.`,
    `Total shift: +${parameterShiftTotal.toFixed(2)} ${spec.parameterUnit} over ${numberOfDaysToTarget} day(s).`,
  ];

  if (numberOfDaysToTarget > 1) {
    notes.push(
      `Paced at max +${maxShiftPerDay} ${spec.parameterUnit}/day to prevent osmotic or chemical shock to livestock.`
    );
  }

  return {
    isSafe: true,
    totalRequiredProductAmount: Number(totalRequiredProductAmount.toFixed(2)),
    recommendedDailyProductAmount: Number(recommendedDailyProductAmount.toFixed(2)),
    productUnit: spec.productUnit,
    parameterShiftTotal: Number(parameterShiftTotal.toFixed(2)),
    numberOfDaysToTarget,
    notes,
  };
}
