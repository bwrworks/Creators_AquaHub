/**
 * Cross-Runtime Zod Validation Schemas for Creators AquaHub
 */

import { z } from "zod";

export const TankWaterCategorySchema = z.enum(["freshwater", "planted", "marine_reef"]);
export const VolumeUnitSchema = z.enum(["litre", "us_gallon", "uk_gallon"]);
export const PrivacySettingSchema = z.enum(["private", "unlisted", "public"]);

export const CreateTankInputSchema = z.object({
  name: z.string().trim().min(1, "Tank name is required").max(100, "Tank name must be under 100 characters"),
  tankType: TankWaterCategorySchema,
  volumeValue: z.number().positive("Volume must be greater than zero").optional(),
  volumeUnit: VolumeUnitSchema.default("litre"),
  setupDate: z.string().optional(), // ISO date YYYY-MM-DD
  description: z.string().max(2000).optional(),
  privacy: PrivacySettingSchema.default("private"),
});

export const ParameterReadingInputSchema = z.object({
  tankId: z.string().uuid("Invalid tank identifier"),
  parameterSlug: z.string().min(1),
  originalValue: z.number().finite("Measurement value must be a valid number"),
  originalUnit: z.string().min(1),
  observedAt: z.string().datetime("Observed timestamp must be valid ISO-8601"),
  testMethod: z.enum(["lab_photometer", "liquid_titration", "test_strip", "device_telemetry", "estimate"]).default("liquid_titration"),
  testKit: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const AquaHubAIResponseSchema = z.object({
  answer: z.string().min(1),
  observedFacts: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      sourceId: z.string(),
      observedAt: z.string(),
      freshness: z.enum(["fresh", "aging", "stale"]),
    })
  ),
  possibleCauses: z.array(
    z.object({
      text: z.string(),
      confidence: z.enum(["low", "medium", "high"]),
      evidenceIds: z.array(z.string()).default([]),
    })
  ).default([]),
  missingInformation: z.array(z.string()).default([]),
  recommendedNextSteps: z.array(z.string()).default([]),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
      version: z.string().optional(),
    })
  ).default([]),
  safetyLevel: z.enum(["normal", "caution", "requires_expert"]).default("normal"),
  uncertaintyNote: z.string().optional(),
});

export type CreateTankInput = z.infer<typeof CreateTankInputSchema>;
export type ParameterReadingInput = z.infer<typeof ParameterReadingInputSchema>;
export type AquaHubAIResponse = z.infer<typeof AquaHubAIResponseSchema>;
