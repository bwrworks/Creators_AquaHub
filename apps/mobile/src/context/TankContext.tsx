import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type WaterCategory = "planted" | "marine_reef" | "freshwater";

export interface ParameterEntry {
  id: string;
  slug: string;
  name: string;
  value: number;
  unit: string;
  observedAt: string;
  freshness: "fresh" | "aging" | "stale";
  idealRange: string;
  testKit?: string;
}

export interface LivestockEntry {
  id: string;
  name: string;
  species?: string;
  category: "fish" | "coral" | "plant" | "invertebrate";
  quantity: number;
  status: "healthy" | "quarantine" | "monitoring";
  acquiredDate?: string;
}

export interface EquipmentEntry {
  id: string;
  name: string;
  category: "lighting" | "flow" | "filtration" | "dosing" | "heating";
  brand?: string;
  model?: string;
  status: "active" | "maintenance_due";
}

export interface Tank {
  id: string;
  name: string;
  category: WaterCategory;
  categoryLabel: string;
  volumeLiters: number;
  volumeGallons: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
  setupDate: string;
  description: string;
  imageKey: "planted" | "reef" | "biotope" | "custom";
  customImageUrl?: string;
  parameters: ParameterEntry[];
  livestock: LivestockEntry[];
  equipment: EquipmentEntry[];
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  isLoggedIn: boolean;
  tier: "Free Tier" | "Pro";
}

interface TankContextType {
  tanks: Tank[];
  activeTankId: string | null;
  activeTank: Tank | null;
  user: UserProfile;
  setActiveTankId: (id: string | null) => void;
  addTank: (tankData: Omit<Tank, "id" | "parameters" | "livestock" | "equipment">) => void;
  deleteTank: (id: string) => void;
  logParameter: (tankId: string, entry: Omit<ParameterEntry, "id" | "observedAt" | "freshness">) => void;
  addLivestock: (tankId: string, item: Omit<LivestockEntry, "id">) => void;
  addEquipment: (tankId: string, item: Omit<EquipmentEntry, "id">) => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  resetToDemo: () => void;
}

const STORAGE_KEY_TANKS = "@cah_tanks_v1";
const STORAGE_KEY_USER = "@cah_user_v1";

const DEFAULT_USER: UserProfile = {
  id: "user-kiran-01",
  name: "Kiran R.",
  handle: "@kiran_aquascapes",
  email: "kiran@creatorsaquarium.com",
  isLoggedIn: true,
  tier: "Free Tier",
};

const INITIAL_TANKS: Tank[] = [
  {
    id: "tank-planted-01",
    name: "ADA Nature 60P - High Tech",
    category: "planted",
    categoryLabel: "Nature Aquarium",
    volumeLiters: 64,
    volumeGallons: 16.9,
    dimensions: { length: 60, width: 30, height: 36, unit: "cm" },
    setupDate: "2026-03-15",
    description: "High-tech Iwagumi layout with Seiryu stones, Hemianthus callitrichoides 'Cuba' carpet, and inline pressurized CO2 at 30 ppm.",
    imageKey: "planted",
    parameters: [
      { id: "p-1", slug: "ph", name: "pH", value: 6.6, unit: "pH", observedAt: "4 hours ago", freshness: "fresh", idealRange: "6.4 - 6.8", testKit: "Hanna Digital pH" },
      { id: "p-2", slug: "kh", name: "Carbonate (KH)", value: 3.5, unit: "dKH", observedAt: "1 day ago", freshness: "fresh", idealRange: "3.0 - 5.0 dKH", testKit: "Salifert KH" },
      { id: "p-3", slug: "no3", name: "Nitrate (NO3)", value: 12.0, unit: "ppm", observedAt: "2 days ago", freshness: "fresh", idealRange: "10 - 20 ppm", testKit: "Salifert NO3" },
      { id: "p-4", slug: "po4", name: "Phosphate (PO4)", value: 0.8, unit: "ppm", observedAt: "2 days ago", freshness: "fresh", idealRange: "0.5 - 1.5 ppm", testKit: "Hanna Checker" },
      { id: "p-5", slug: "temp", name: "Temperature", value: 24.5, unit: "°C", observedAt: "Live Telemetry", freshness: "fresh", idealRange: "24 - 26 °C", testKit: "Calibrated Probe" },
    ],
    livestock: [
      { id: "ls-1", name: "Cardina japonica", species: "Amano Shrimp", category: "invertebrate", quantity: 12, status: "healthy" },
      { id: "ls-2", name: "Hyphessobrycon amandae", species: "Ember Tetra", category: "fish", quantity: 20, status: "healthy" },
      { id: "ls-3", name: "Hemianthus callitrichoides", species: "Cuba Carpet", category: "plant", quantity: 5, status: "healthy" },
    ],
    equipment: [
      { id: "eq-1", name: "Twinstar 600EA LED", category: "lighting", brand: "Twinstar", status: "active" },
      { id: "eq-2", name: "Oase Biomaster Thermo 350", category: "filtration", brand: "Oase", status: "active" },
      { id: "eq-3", name: "CO2Art Inline Diffuser", category: "dosing", brand: "CO2Art", status: "active" },
    ],
  },
  {
    id: "tank-reef-02",
    name: "Red Sea Reefer 250 - Mixed Reef",
    category: "marine_reef",
    categoryLabel: "ReefBay System",
    volumeLiters: 204,
    volumeGallons: 53.9,
    dimensions: { length: 90, width: 50, height: 53, unit: "cm" },
    setupDate: "2025-11-20",
    description: "ReefBay-style mixed reef featuring Euphyllia coral garden, branching SPS Acropora, automated 2-part dosing, and roller fleece filtration.",
    imageKey: "reef",
    parameters: [
      { id: "p-10", slug: "salinity", name: "Salinity", value: 1.025, unit: "sg", observedAt: "1 day ago", freshness: "fresh", idealRange: "1.025 - 1.026", testKit: "Milwaukee Digital" },
      { id: "p-11", slug: "alk", name: "Alkalinity", value: 8.3, unit: "dKH", observedAt: "18 hours ago", freshness: "fresh", idealRange: "8.0 - 8.6 dKH", testKit: "Hanna Checker" },
      { id: "p-12", slug: "ca", name: "Calcium (Ca)", value: 430, unit: "ppm", observedAt: "3 days ago", freshness: "aging", idealRange: "420 - 440 ppm", testKit: "Salifert Ca" },
      { id: "p-13", slug: "mg", name: "Magnesium (Mg)", value: 1380, unit: "ppm", observedAt: "5 days ago", freshness: "aging", idealRange: "1350 - 1420 ppm", testKit: "Red Sea Pro" },
      { id: "p-14", slug: "no3", name: "Nitrate (NO3)", value: 4.5, unit: "ppm", observedAt: "3 days ago", freshness: "fresh", idealRange: "3 - 8 ppm", testKit: "Nyos Nitrate" },
      { id: "p-15", slug: "po4", name: "Phosphate (PO4)", value: 0.035, unit: "ppm", observedAt: "3 days ago", freshness: "fresh", idealRange: "0.02 - 0.05 ppm", testKit: "Hanna Ultra Low" },
    ],
    livestock: [
      { id: "ls-10", name: "Amphiprion ocellaris", species: "Clownfish Pair", category: "fish", quantity: 2, status: "healthy" },
      { id: "ls-11", name: "Zebrasoma flavescens", species: "Yellow Tang (Biota)", category: "fish", quantity: 1, status: "healthy" },
      { id: "ls-12", name: "Euphyllia glabrescens", species: "Gold Torch Coral", category: "coral", quantity: 3, status: "healthy" },
      { id: "ls-13", name: "Acropora tenuis", species: "SPS Frag Colony", category: "coral", quantity: 4, status: "healthy" },
    ],
    equipment: [
      { id: "eq-10", name: "Radion XR15 G6 Pro (Pair)", category: "lighting", brand: "EcoTech", status: "active" },
      { id: "eq-11", name: "Vortech MP40 QuietDrive", category: "flow", brand: "EcoTech", status: "active" },
      { id: "eq-12", name: "Nyos Quantum 120", category: "filtration", brand: "Nyos", status: "active" },
    ],
  },
  {
    id: "tank-biotope-03",
    name: "Rio Negro Blackwater Biotope",
    category: "freshwater",
    categoryLabel: "Wild Amazonian",
    volumeLiters: 120,
    volumeGallons: 31.7,
    dimensions: { length: 80, width: 35, height: 45, unit: "cm" },
    setupDate: "2025-08-10",
    description: "Botanical-style wild Heckel discus & cardinal tetra environment with Catappa leaves, Malaysian driftwood, and warm amber tannins.",
    imageKey: "biotope",
    parameters: [
      { id: "p-20", slug: "ph", name: "pH", value: 5.6, unit: "pH", observedAt: "12 days ago", freshness: "stale", idealRange: "5.4 - 6.2", testKit: "API Master Kit" },
      { id: "p-21", slug: "tds", name: "TDS", value: 35, unit: "ppm", observedAt: "5 days ago", freshness: "aging", idealRange: "20 - 50 ppm", testKit: "HM Digital" },
      { id: "p-22", slug: "temp", name: "Temperature", value: 28.5, unit: "°C", observedAt: "1 day ago", freshness: "fresh", idealRange: "28 - 30 °C", testKit: "Inkbird Digital" },
    ],
    livestock: [
      { id: "ls-20", name: "Symphysodon heckel", species: "Wild Heckel Discus", category: "fish", quantity: 5, status: "healthy" },
      { id: "ls-21", name: "Paracheirodon axelrodi", species: "Cardinal Tetra", category: "fish", quantity: 30, status: "healthy" },
    ],
    equipment: [
      { id: "eq-20", name: "Fluval 307 Canister", category: "filtration", brand: "Fluval", status: "active" },
      { id: "eq-21", name: "Eheim Jager 150W", category: "heating", brand: "Eheim", status: "active" },
    ],
  },
];

const TankContext = createContext<TankContextType | null>(null);

export function TankProvider({ children }: { children: React.ReactNode }) {
  const [tanks, setTanks] = useState<Tank[]>(INITIAL_TANKS);
  const [activeTankId, setActiveTankId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  // Load persisted tanks & user on mount
  useEffect(() => {
    (async () => {
      try {
        const storedTanks = await AsyncStorage.getItem(STORAGE_KEY_TANKS);
        if (storedTanks) {
          setTanks(JSON.parse(storedTanks));
        }
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn("AsyncStorage load fallback to initial state:", err);
      }
    })();
  }, []);

  // Save changes to storage
  const persistTanks = async (updatedTanks: Tank[]) => {
    setTanks(updatedTanks);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TANKS, JSON.stringify(updatedTanks));
    } catch (err) {
      console.warn("Failed to persist tanks:", err);
    }
  };

  const addTank = (tankData: Omit<Tank, "id" | "parameters" | "livestock" | "equipment">) => {
    const newTank: Tank = {
      ...tankData,
      id: `tank-${Date.now().toString(36)}`,
      parameters: [
        { id: `p-${Date.now()}-1`, slug: "temp", name: "Temperature", value: 25.0, unit: "°C", observedAt: "Just now", freshness: "fresh", idealRange: "24 - 26 °C" },
        { id: `p-${Date.now()}-2`, slug: "ph", name: "pH", value: 7.0, unit: "pH", observedAt: "Just now", freshness: "fresh", idealRange: "6.5 - 7.5" },
      ],
      livestock: [],
      equipment: [],
    };
    const updated = [newTank, ...tanks];
    persistTanks(updated);
    setActiveTankId(newTank.id);
  };

  const deleteTank = (id: string) => {
    const updated = tanks.filter((t) => t.id !== id);
    persistTanks(updated);
    if (activeTankId === id) {
      setActiveTankId(null);
    }
  };

  const logParameter = (tankId: string, entry: Omit<ParameterEntry, "id" | "observedAt" | "freshness">) => {
    const updated = tanks.map((tank) => {
      if (tank.id !== tankId) return tank;
      const newEntry: ParameterEntry = {
        ...entry,
        id: `p-${Date.now()}`,
        observedAt: "Just now",
        freshness: "fresh",
      };
      // Replace existing parameter with same slug or prepend
      const existingIdx = tank.parameters.findIndex((p) => p.slug === entry.slug);
      let updatedParams = [...tank.parameters];
      if (existingIdx >= 0) {
        updatedParams[existingIdx] = newEntry;
      } else {
        updatedParams.unshift(newEntry);
      }
      return { ...tank, parameters: updatedParams };
    });
    persistTanks(updated);
  };

  const addLivestock = (tankId: string, item: Omit<LivestockEntry, "id">) => {
    const updated = tanks.map((tank) => {
      if (tank.id !== tankId) return tank;
      const newLivestock: LivestockEntry = {
        ...item,
        id: `ls-${Date.now()}`,
      };
      return { ...tank, livestock: [newLivestock, ...tank.livestock] };
    });
    persistTanks(updated);
  };

  const addEquipment = (tankId: string, item: Omit<EquipmentEntry, "id">) => {
    const updated = tanks.map((tank) => {
      if (tank.id !== tankId) return tank;
      const newEquipment: EquipmentEntry = {
        ...item,
        id: `eq-${Date.now()}`,
      };
      return { ...tank, equipment: [newEquipment, ...tank.equipment] };
    });
    persistTanks(updated);
  };

  const loginUser = (email: string, name = "Aquarist") => {
    const handle = `@${email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
    const updated: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      handle,
      email,
      isLoggedIn: true,
      tier: "Free Tier",
    };
    setUser(updated);
    AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated)).catch(() => {});
  };

  const logoutUser = () => {
    const guest: UserProfile = {
      id: "guest",
      name: "Guest Explorer",
      handle: "@guest",
      email: "",
      isLoggedIn: false,
      tier: "Free Tier",
    };
    setUser(guest);
    AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guest)).catch(() => {});
  };

  const resetToDemo = () => {
    persistTanks(INITIAL_TANKS);
    setUser(DEFAULT_USER);
  };

  const activeTank = tanks.find((t) => t.id === activeTankId) || null;

  return (
    <TankContext.Provider
      value={{
        tanks,
        activeTankId,
        activeTank,
        user,
        setActiveTankId,
        addTank,
        deleteTank,
        logParameter,
        addLivestock,
        addEquipment,
        loginUser,
        logoutUser,
        resetToDemo,
      }}
    >
      {children}
    </TankContext.Provider>
  );
}

export function useTanks() {
  const context = useContext(TankContext);
  if (!context) {
    throw new Error("useTanks must be used within a TankProvider");
  }
  return context;
}
