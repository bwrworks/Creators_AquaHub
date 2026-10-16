import { ImageSourcePropType } from "react-native";

export const TANK_HERO_ASSETS: Record<"planted" | "reef" | "biotope", ImageSourcePropType> = {
  planted: require("../../assets/tanks/tank_planted.jpg"),
  reef: require("../../assets/tanks/tank_reef.jpg"),
  biotope: require("../../assets/tanks/tank_biotope.jpg"),
};

export function getTankImage(tank: {
  imageKey?: "planted" | "reef" | "biotope" | "custom" | string;
  customImageUrl?: string;
  category?: string;
}): ImageSourcePropType {
  if (tank.customImageUrl && tank.customImageUrl.trim().length > 0) {
    return { uri: tank.customImageUrl };
  }
  if (tank.imageKey === "reef" || tank.category === "marine_reef") {
    return TANK_HERO_ASSETS.reef;
  }
  if (tank.imageKey === "biotope" || tank.category === "freshwater") {
    return TANK_HERO_ASSETS.biotope;
  }
  return TANK_HERO_ASSETS.planted;
}
