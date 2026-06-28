export type ColorSchemeId =
  | "indigo"
  | "emerald"
  | "crimson"
  | "amber"
  | "violet"
  | "teal"
  | "rose"
  | "slate";

interface SchemeMode {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  sidebarPrimary: string;
  sidebarRing: string;
  chart1: string;
}

export interface ColorScheme {
  id: ColorSchemeId;
  name: string;
  description: string;
  swatch: string;
  light: SchemeMode;
  dark: SchemeMode;
}

export const colorSchemes: ColorScheme[] = [
  {
    id: "indigo",
    name: "Indigo",
    description: "Hexaware default · electric indigo",
    swatch: "hsl(230 80% 55%)",
    light: {
      primary: "230 80% 55%",
      primaryForeground: "0 0% 100%",
      accent: "230 80% 96%",
      accentForeground: "230 80% 45%",
      ring: "230 80% 55%",
      sidebarPrimary: "230 80% 60%",
      sidebarRing: "230 80% 60%",
      chart1: "230 80% 60%",
    },
    dark: {
      primary: "230 80% 60%",
      primaryForeground: "0 0% 100%",
      accent: "230 80% 20%",
      accentForeground: "230 80% 80%",
      ring: "230 80% 60%",
      sidebarPrimary: "230 80% 60%",
      sidebarRing: "230 80% 60%",
      chart1: "230 80% 65%",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Calm growth · forest green",
    swatch: "hsl(160 70% 38%)",
    light: {
      primary: "160 70% 38%",
      primaryForeground: "0 0% 100%",
      accent: "160 60% 94%",
      accentForeground: "160 70% 28%",
      ring: "160 70% 38%",
      sidebarPrimary: "160 70% 45%",
      sidebarRing: "160 70% 45%",
      chart1: "160 70% 45%",
    },
    dark: {
      primary: "160 70% 50%",
      primaryForeground: "160 80% 10%",
      accent: "160 50% 18%",
      accentForeground: "160 60% 80%",
      ring: "160 70% 50%",
      sidebarPrimary: "160 70% 50%",
      sidebarRing: "160 70% 50%",
      chart1: "160 70% 55%",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Bold focus · executive red",
    swatch: "hsl(350 80% 50%)",
    light: {
      primary: "350 80% 50%",
      primaryForeground: "0 0% 100%",
      accent: "350 80% 96%",
      accentForeground: "350 80% 40%",
      ring: "350 80% 50%",
      sidebarPrimary: "350 80% 55%",
      sidebarRing: "350 80% 55%",
      chart1: "350 80% 55%",
    },
    dark: {
      primary: "350 80% 60%",
      primaryForeground: "0 0% 100%",
      accent: "350 50% 22%",
      accentForeground: "350 80% 85%",
      ring: "350 80% 60%",
      sidebarPrimary: "350 80% 60%",
      sidebarRing: "350 80% 60%",
      chart1: "350 80% 60%",
    },
  },
  {
    id: "amber",
    name: "Amber",
    description: "Warm energy · golden hour",
    swatch: "hsl(35 90% 50%)",
    light: {
      primary: "35 90% 48%",
      primaryForeground: "30 50% 10%",
      accent: "35 90% 95%",
      accentForeground: "30 80% 35%",
      ring: "35 90% 48%",
      sidebarPrimary: "35 90% 55%",
      sidebarRing: "35 90% 55%",
      chart1: "35 90% 55%",
    },
    dark: {
      primary: "35 95% 60%",
      primaryForeground: "30 50% 10%",
      accent: "35 60% 20%",
      accentForeground: "35 95% 85%",
      ring: "35 95% 60%",
      sidebarPrimary: "35 95% 60%",
      sidebarRing: "35 95% 60%",
      chart1: "35 95% 60%",
    },
  },
  {
    id: "violet",
    name: "Violet",
    description: "Creative depth · twilight purple",
    swatch: "hsl(270 75% 58%)",
    light: {
      primary: "270 75% 58%",
      primaryForeground: "0 0% 100%",
      accent: "270 75% 96%",
      accentForeground: "270 75% 45%",
      ring: "270 75% 58%",
      sidebarPrimary: "270 75% 62%",
      sidebarRing: "270 75% 62%",
      chart1: "270 75% 62%",
    },
    dark: {
      primary: "270 75% 65%",
      primaryForeground: "0 0% 100%",
      accent: "270 50% 22%",
      accentForeground: "270 75% 85%",
      ring: "270 75% 65%",
      sidebarPrimary: "270 75% 65%",
      sidebarRing: "270 75% 65%",
      chart1: "270 75% 65%",
    },
  },
  {
    id: "teal",
    name: "Teal",
    description: "Cool clarity · ocean teal",
    swatch: "hsl(190 80% 42%)",
    light: {
      primary: "190 80% 40%",
      primaryForeground: "0 0% 100%",
      accent: "190 80% 95%",
      accentForeground: "190 80% 30%",
      ring: "190 80% 40%",
      sidebarPrimary: "190 80% 48%",
      sidebarRing: "190 80% 48%",
      chart1: "190 80% 48%",
    },
    dark: {
      primary: "190 80% 55%",
      primaryForeground: "190 80% 10%",
      accent: "190 50% 20%",
      accentForeground: "190 80% 85%",
      ring: "190 80% 55%",
      sidebarPrimary: "190 80% 55%",
      sidebarRing: "190 80% 55%",
      chart1: "190 80% 55%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Soft confidence · dusk rose",
    swatch: "hsl(335 75% 58%)",
    light: {
      primary: "335 75% 55%",
      primaryForeground: "0 0% 100%",
      accent: "335 75% 96%",
      accentForeground: "335 75% 42%",
      ring: "335 75% 55%",
      sidebarPrimary: "335 75% 60%",
      sidebarRing: "335 75% 60%",
      chart1: "335 75% 60%",
    },
    dark: {
      primary: "335 75% 62%",
      primaryForeground: "0 0% 100%",
      accent: "335 50% 22%",
      accentForeground: "335 75% 85%",
      ring: "335 75% 62%",
      sidebarPrimary: "335 75% 62%",
      sidebarRing: "335 75% 62%",
      chart1: "335 75% 62%",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Quiet authority · graphite",
    swatch: "hsl(220 15% 35%)",
    light: {
      primary: "220 15% 25%",
      primaryForeground: "0 0% 100%",
      accent: "220 15% 94%",
      accentForeground: "220 15% 25%",
      ring: "220 15% 35%",
      sidebarPrimary: "220 15% 45%",
      sidebarRing: "220 15% 50%",
      chart1: "220 15% 45%",
    },
    dark: {
      primary: "220 15% 75%",
      primaryForeground: "220 30% 10%",
      accent: "220 15% 22%",
      accentForeground: "220 15% 90%",
      ring: "220 15% 75%",
      sidebarPrimary: "220 15% 75%",
      sidebarRing: "220 15% 75%",
      chart1: "220 15% 70%",
    },
  },
];

export const defaultSchemeId: ColorSchemeId = "indigo";
