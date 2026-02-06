/**
 * Realm Configuration - Defines the visual testing universe boundaries
 */

export interface DimensionPortal {
  width: number;
  height: number;
  isMobile: boolean;
}

export interface RealmBoundaries {
  anchors: {
    current: string;
    reference: string;
  };
  dimensions: Record<string, DimensionPortal>;
  sourceOracleTexts: {
    miniUrls: string;
    fullUrls: string;
  };
  targetNexus: string;
}

const REALM_BOUNDARIES: RealmBoundaries = {
  anchors: {
    current: "screenshots-current",
    reference: "screenshots-originals",
  },
  dimensions: {
    quantum_ultra_wide: { width: 1920, height: 1080, isMobile: false },
    quantum_standard: { width: 1440, height: 900, isMobile: false },
  },
  sourceOracleTexts: {
    miniUrls: "./constants/nl-urls.mini.txt",
    fullUrls: "./constants/nl-urls.txt",
  },
  targetNexus: "https://www.mitsubishi-motors.nl",
};

export const fetchRealmConfig = (): RealmBoundaries => REALM_BOUNDARIES;

export const extractDimensionKeys = (config: RealmBoundaries): string[] =>
  Object.keys(config.dimensions);
