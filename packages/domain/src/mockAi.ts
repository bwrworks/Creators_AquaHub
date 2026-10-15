/**
 * Zero-Cost Mock AI Adapter for Local Development & Automated CI Testing
 * Emulates structured response contracts without making external network calls or burning quotas.
 */

import { AquaHubAIResponse } from "./validation.js";
import { FreshnessState } from "./parameters.js";

export interface MockQuestionInput {
  question: string;
  waterCategory: "freshwater" | "planted" | "marine_reef";
  tankVolumeLitres?: number;
  recentReadings?: Array<{
    label: string;
    value: string;
    observedAt: string;
    freshness: FreshnessState;
    sourceId: string;
  }>;
}

export function generateMockAIResponse(input: MockQuestionInput): AquaHubAIResponse {
  const { question, waterCategory, recentReadings = [], tankVolumeLitres } = input;

  // Rule 1: Dosing ask without volume or readings -> Missing data abstention
  const isDosingAsk = /dose|dosing|add|buffer|increase|ppm/i.test(question);
  if (isDosingAsk && (!tankVolumeLitres || recentReadings.length === 0)) {
    return {
      answer:
        "To provide a safe dosing calculation, I require verified net water volume and recent chemical test readings. Chemical overdosing can cause rapid osmotic shock to fish and invertebrates.",
      observedFacts: [],
      possibleCauses: [],
      missingInformation: [
        !tankVolumeLitres ? "Accurate net aquarium water volume (Litres or Gallons)" : "",
        recentReadings.length === 0 ? "Current water parameter test reading" : "",
      ].filter(Boolean),
      recommendedNextSteps: [
        "Record tank dimensions in My Tanks to compute net water volume.",
        "Perform a fresh liquid test kit reading before adding chemical supplements.",
      ],
      sources: [
        {
          title: "Creators Aquarium Care Reference: Safe Dosing Guidelines",
          version: "1.0",
        },
      ],
      safetyLevel: "caution",
      uncertaintyNote: "Numeric recommendation withheld due to missing baseline volume/chemistry inputs.",
    };
  }

  // Rule 2: Stale reading warning
  const staleReadings = recentReadings.filter((r) => r.freshness === "stale");
  let uncertaintyNote = undefined;
  if (staleReadings.length > 0) {
    uncertaintyNote = `Notice: Some parameters (${staleReadings.map((r) => r.label).join(", ")}) are stale. Water chemistry may have shifted.`;
  }

  return {
    answer: `Analysis for your ${waterCategory.replace("_", " ")} aquarium: regular water testing and routine biological filtration maintenance ensure long-term stability.`,
    observedFacts: recentReadings.map((r) => ({
      label: r.label,
      value: r.value,
      sourceId: r.sourceId,
      observedAt: r.observedAt,
      freshness: r.freshness,
    })),
    possibleCauses: [
      {
        text: "Biological cycle is stable with established nitrifying bacteria.",
        confidence: "high",
        evidenceIds: recentReadings.map((r) => r.sourceId),
      },
    ],
    missingInformation: [],
    recommendedNextSteps: [
      "Maintain consistent photoperiod and feeding schedule.",
      "Log routine weekly water change.",
    ],
    sources: [
      {
        title: "Creators Aquarium Baseline Water Quality Standards",
        url: "https://www.creatorsaquarium.com/",
        version: "1.0",
      },
    ],
    safetyLevel: "normal",
    uncertaintyNote,
  };
}
