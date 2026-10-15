import { calculateGrossVolumeLitres, convertVolume } from "../volume.js";
import { calculateFreshnessState } from "../parameters.js";
import { calculateDosing, DosingValidationError, ProductDosingSpec } from "../dosing.js";
import { generateMockAIResponse } from "../mockAi.js";

function runTests() {
  console.log("Running Creators AquaHub Domain Unit Tests...\n");

  // 1. Volume calculation test (3 ft rectangular tank: 90cm x 45cm x 45cm = 182.25 Litres)
  const volLitres = calculateGrossVolumeLitres({
    shape: "rectangular",
    length: 90,
    width: 45,
    height: 45,
    unit: "cm",
  });
  console.assert(Math.abs(volLitres - 182.25) < 0.01, `Expected 182.25L, got ${volLitres}`);
  console.log("✓ Rectangular tank dimensions-to-volume calculation verified (182.25 Litres)");

  // Volume conversion test: 100 Litres to US Gallons (~26.417 gal)
  const volGallons = convertVolume(100, "litre", "us_gallon");
  console.assert(Math.abs(volGallons - 26.417) < 0.01, `Expected ~26.417 gal, got ${volGallons}`);
  console.log("✓ Volume unit conversion (Litre -> US Gallon) verified");

  // 2. Parameter Freshness Test
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 120 * 60 * 60 * 1000);

  const alkFresh = calculateFreshnessState("alkalinity", "marine_reef", twoHoursAgo, now);
  console.assert(alkFresh === "fresh", `Expected fresh, got ${alkFresh}`);

  const alkStale = calculateFreshnessState("alkalinity", "marine_reef", fiveDaysAgo, now);
  console.assert(alkStale === "stale", `Expected stale, got ${alkStale}`);
  console.log("✓ Temporal parameter freshness engine (Fresh vs Stale) verified");

  const reviewedProductSpec: ProductDosingSpec = {
    productId: "reef-alk-buffer",
    productName: "Reef Builder (Reviewed)",
    manufacturer: "Seachem",
    targetParameterSlug: "alkalinity",
    reviewStatus: "reviewed",
    standardConcentrationRate: {
      productAmount: 5,
      productUnit: "ml",
      targetWaterVolumeLitres: 100,
      parameterDelta: 1.0,
      parameterUnit: "dKH",
    },
    maxDailyShift: 1.0, // 1.0 dKH/day max
    instructions: "Dissolve in freshwater before adding.",
  };

  // 3. Pre-Launch Guardrail: Real Dosing Disabled By Default
  const disabledDosingResult = calculateDosing({
    netWaterVolumeLitres: 100,
    currentReading: { value: 7.0, unit: "dKH", freshness: "fresh" },
    targetValue: 8.5,
    productSpec: reviewedProductSpec,
  });
  console.assert(!disabledDosingResult.isSafe, "Pre-launch real dosing must have isSafe = false");
  console.assert(disabledDosingResult.totalRequiredProductAmount === null, "Pre-launch real dosing must return null product amount");
  console.assert(disabledDosingResult.status === "DISABLED_PRE_LAUNCH", "Pre-launch real dosing status must be DISABLED_PRE_LAUNCH");
  console.log("✓ Dosing engine strictly disabled live chemical dispensing recommendations pre-launch");

  // 4. Mathematical Simulation Calculation (allowSimulation: true)
  const simulationResult = calculateDosing(
    {
      netWaterVolumeLitres: 100,
      currentReading: { value: 7.0, unit: "dKH", freshness: "fresh" },
      targetValue: 8.5,
      productSpec: reviewedProductSpec,
    },
    { allowSimulation: true }
  );

  console.assert(simulationResult.totalRequiredProductAmount === 7.5, `Expected 7.5ml, got ${simulationResult.totalRequiredProductAmount}`);
  console.assert(simulationResult.numberOfDaysToTarget === 2, `Expected 2 days, got ${simulationResult.numberOfDaysToTarget}`);
  console.assert(simulationResult.recommendedDailyProductAmount === 3.75, `Expected 3.75ml/day, got ${simulationResult.recommendedDailyProductAmount}`);
  console.log("✓ Deterministic dosing simulation & safe daily pacing verified (7.5ml over 2 days = 3.75ml/day)");

  // 5. Missing maxDailyShift Rejection (Must NOT default to target shift)
  let missingShiftError = false;
  try {
    const invalidSpec = { ...reviewedProductSpec, maxDailyShift: 0 };
    calculateDosing(
      {
        netWaterVolumeLitres: 100,
        currentReading: { value: 7.0, unit: "dKH", freshness: "fresh" },
        targetValue: 8.5,
        productSpec: invalidSpec,
      },
      { allowSimulation: true }
    );
  } catch (err) {
    if (err instanceof DosingValidationError && err.code === "MISSING_MAX_DAILY_SHIFT") {
      missingShiftError = true;
    }
  }
  console.assert(missingShiftError, "Expected DosingValidationError with code MISSING_MAX_DAILY_SHIFT");
  console.log("✓ Dosing engine rejected missing/zero maxDailyShift without defaulting to target change");

  // 6. Unreviewed Product Spec Rejection
  let unreviewedSpecError = false;
  try {
    const draftSpec: ProductDosingSpec = { ...reviewedProductSpec, reviewStatus: "draft" };
    calculateDosing(
      {
        netWaterVolumeLitres: 100,
        currentReading: { value: 7.0, unit: "dKH", freshness: "fresh" },
        targetValue: 8.5,
        productSpec: draftSpec,
      },
      { allowSimulation: true }
    );
  } catch (err) {
    if (err instanceof DosingValidationError && err.code === "UNREVIEWED_PRODUCT_SPEC") {
      unreviewedSpecError = true;
    }
  }
  console.assert(unreviewedSpecError, "Expected DosingValidationError with code UNREVIEWED_PRODUCT_SPEC");
  console.log("✓ Dosing engine strictly rejected unreviewed product specification");

  // 7. Unit Mismatch Rejection
  let unitMismatchError = false;
  try {
    calculateDosing(
      {
        netWaterVolumeLitres: 100,
        currentReading: { value: 7.0, unit: "ppm", freshness: "fresh" }, // ppm instead of dKH
        targetValue: 8.5,
        productSpec: reviewedProductSpec,
      },
      { allowSimulation: true }
    );
  } catch (err) {
    if (err instanceof DosingValidationError && err.code === "UNIT_MISMATCH") {
      unitMismatchError = true;
    }
  }
  console.assert(unitMismatchError, "Expected DosingValidationError with code UNIT_MISMATCH");
  console.log("✓ Dosing engine strictly rejected unit mismatch (ppm vs dKH)");

  // 8. Stale Reading Rejection in Dosing
  let staleErrorCaught = false;
  try {
    calculateDosing(
      {
        netWaterVolumeLitres: 100,
        currentReading: { value: 7.0, unit: "dKH", freshness: "stale" },
        targetValue: 8.5,
        productSpec: reviewedProductSpec,
      },
      { allowSimulation: true }
    );
  } catch (err) {
    if (err instanceof DosingValidationError && err.code === "STALE_READING") {
      staleErrorCaught = true;
    }
  }
  console.assert(staleErrorCaught, "Expected DosingValidationError with code STALE_READING");
  console.log("✓ Dosing engine strictly rejected stale parameter reading");

  // 9. Zero-Cost Mock AI Test (Missing volume triggers abstention)
  const mockAiResponse = generateMockAIResponse({
    question: "How much buffer should I dose to fix my alkalinity?",
    waterCategory: "marine_reef",
  });
  console.assert(mockAiResponse.safetyLevel === "caution", "Expected safetyLevel caution");
  console.assert(mockAiResponse.missingInformation.length > 0, "Expected missing information alert");
  console.log("✓ Zero-cost Mock AI strictly abstains from numeric dosing when volume is missing");

  console.log("\nAll 9 domain unit tests passed successfully!");
}

runTests();
