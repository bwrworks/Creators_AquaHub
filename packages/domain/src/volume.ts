/**
 * Tank Dimensions and Volume Calculation Engine
 */

export type VolumeUnit = "litre" | "us_gallon" | "uk_gallon";
export type DimensionUnit = "cm" | "inch";

export interface RectangularDimensions {
  shape: "rectangular";
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface CylinderDimensions {
  shape: "cylinder";
  diameter: number;
  height: number;
  unit: DimensionUnit;
}

export interface BowfrontDimensions {
  shape: "bowfront";
  length: number;
  widthSides: number;
  widthCenter: number;
  height: number;
  unit: DimensionUnit;
}

export type TankDimensions =
  | RectangularDimensions
  | CylinderDimensions
  | BowfrontDimensions;

const CM3_PER_LITRE = 1000;
const INCH3_PER_LITRE = 61.023744;
const LITRES_PER_US_GALLON = 3.785411784;
const LITRES_PER_UK_GALLON = 4.54609;

/**
 * Calculates gross water volume in Litres from geometric dimensions.
 */
export function calculateGrossVolumeLitres(dimensions: TankDimensions): number {
  if (dimensions.shape === "rectangular") {
    const { length, width, height, unit } = dimensions;
    if (length <= 0 || width <= 0 || height <= 0) return 0;

    if (unit === "cm") {
      return (length * width * height) / CM3_PER_LITRE;
    } else {
      return (length * width * height) / INCH3_PER_LITRE;
    }
  }

  if (dimensions.shape === "cylinder") {
    const { diameter, height, unit } = dimensions;
    if (diameter <= 0 || height <= 0) return 0;
    const radius = diameter / 2;
    const volume = Math.PI * radius * radius * height;

    if (unit === "cm") {
      return volume / CM3_PER_LITRE;
    } else {
      return volume / INCH3_PER_LITRE;
    }
  }

  if (dimensions.shape === "bowfront") {
    const { length, widthSides, widthCenter, height, unit } = dimensions;
    if (length <= 0 || widthSides <= 0 || widthCenter <= 0 || height <= 0) return 0;
    const avgWidth = (widthSides + widthCenter) / 2;

    if (unit === "cm") {
      return (length * avgWidth * height) / CM3_PER_LITRE;
    } else {
      return (length * avgWidth * height) / INCH3_PER_LITRE;
    }
  }

  return 0;
}

/**
 * Converts volume between units.
 */
export function convertVolume(
  value: number,
  fromUnit: VolumeUnit,
  toUnit: VolumeUnit
): number {
  if (fromUnit === toUnit) return value;

  // Convert to litres first
  let inLitres = value;
  if (fromUnit === "us_gallon") inLitres = value * LITRES_PER_US_GALLON;
  else if (fromUnit === "uk_gallon") inLitres = value * LITRES_PER_UK_GALLON;

  // Convert from litres to target
  if (toUnit === "litre") return inLitres;
  if (toUnit === "us_gallon") return inLitres / LITRES_PER_US_GALLON;
  if (toUnit === "uk_gallon") return inLitres / LITRES_PER_UK_GALLON;

  return inLitres;
}
