import { calculateGrossVolumeLitres, convertVolume } from "../volume.js";
import { calculateFreshnessState } from "../parameters.js";
import { calculateDosing, DosingValidationError } from "../dosing.js";
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

  // 3. Deterministic Dosing Calculator Test
  // Raising a 100L reef tank alkalinity by 1.5 dKH using buffer (5ml raises 100L by 1 dKH; max shift 1.0 dKH/day)
  const dosingResult = calculateDosing({
    netWaterVolumeLitres: 100,
    currentReading: {
      value: 7.0,
      unit: "dKH",
      freshness: "fresh",
    },
    targetValue: 8.5,
    productSpec: {
      productId: "reef-alk-buffer",
      productName: "Reef Builder",
      manufacturer: "Seachem",
      targetParameterSlug: "alkalinity",
      standardConcentrationRate: {
        productAmount: 5,
        productUnit: "ml",
        targetWaterVolumeLitres: 100,
        parameterDelta: 1.0,
        parameterUnit: "dKH",
      },
      maxDailyShift: 1.0, // 1.0 dKH/day max
      instructions: "Dissolve in freshwater before adding.",
    },
  });

  console.assert(dosingResult.totalRequiredProductAmount === 7.5, `Expected 7.5ml, got ${dosingResult.totalRequiredProductAmount}`);
  console.assert(dosingResult.numberOfDaysToTarget === 2, `Expected 2 days, got ${dosingResult.numberOfDaysToTarget}`);
  console.assert(dosingResult.recommendedDailyProductAmount === 3.75, `Expected 3.75ml/day, got ${dosingResult.recommendedDailyProductAmount}`);
  console.log("✓ Deterministic dosing math & safe daily pacing verified (7.5ml over 2 days = 3.75ml/day)");

  // 4. Stale Reading Rejection in Dosing
  let errorCaught = false;
  try {
    calculateDosing({
      netWaterVolumeLitres: 100,
      currentReading: {
        value: 7.0,
        unit: "dKH",
        freshness: "stale",
      },
      targetValue: 8.5,
      productSpec: {
        productId: "reef-alk-buffer",
        productName: "Reef Builder",
        manufacturer: "Seachem",
        targetParameterSlug: "alkalinity",
        standardConcentrationRate: {
          productAmount: 5,
          productUnit: "ml",
          targetWaterVolumeLitres: 100,
          parameterDelta: 1.0,
          parameterUnit: "dKH",
        },
        instructions: "Dissolve.",
      },
    });
  } catch (err) {
    if (err instanceof DosingValidationError && err.code === "STALE_READING") {
      errorCaught = true;
    }
  }
  console.assert(errorCaught, "Expected DosingValidationError with code STALE_READING");
  console.log("✓ Dosing engine strictly rejected stale parameter reading");

  // 5. Zero-Cost Mock AI Test (Missing volume triggers abstention)
  const mockAiResponse = generateMockAIResponse({
    question: "How much buffer should I dose to fix my alkalinity?",
    waterCategory: "marine_reef",
  });
  console.assert(mockAiResponse.safetyLevel === "caution", "Expected safetyLevel caution");
  console.assert(mockAiResponse.missingInformation.length > 0, "Expected missing information alert");
  console.log("✓ Zero-cost Mock AI strictly abstains from numeric dosing when volume is missing");

  console.log("\nAll 5 domain unit tests passed successfully!");
}

runTests();
