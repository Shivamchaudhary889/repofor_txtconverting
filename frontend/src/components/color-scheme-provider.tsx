import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";
import { colorSchemes, defaultSchemeId, type ColorSchemeId, type ColorScheme } from "@/lib/color-schemes";

interface ColorSchemeContextValue {
  schemeId: ColorSchemeId;
  scheme: ColorScheme;
  setSchemeId: (id: ColorSchemeId) => void;
  schemes: ColorScheme[];
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined);

const STORAGE_KEY = "maverick-color-scheme";

function getStoredScheme(): ColorSchemeId {
  if (typeof window === "undefined") return defaultSchemeId;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && colorSchemes.some((s) => s.id === stored)) {
    return stored as ColorSchemeId;
  }
  return defaultSchemeId;
}

function applyScheme(scheme: ColorScheme, isDark: boolean) {
  const root = document.documentElement;
  const mode = isDark ? scheme.dark : scheme.light;
  root.style.setProperty("--primary", mode.primary);
  root.style.setProperty("--primary-foreground", mode.primaryForeground);
  root.style.setProperty("--accent", mode.accent);
  root.style.setProperty("--accent-foreground", mode.accentForeground);
  root.style.setProperty("--ring", mode.ring);
  root.style.setProperty("--sidebar-primary", mode.sidebarPrimary);
  root.style.setProperty("--sidebar-ring", mode.sidebarRing);
  root.style.setProperty("--chart-1", mode.chart1);
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [schemeId, setSchemeIdState] = useState<ColorSchemeId>(defaultSchemeId);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setSchemeIdState(getStoredScheme());
  }, []);

  useEffect(() => {
    const scheme = colorSchemes.find((s) => s.id === schemeId) ?? colorSchemes[0];
    applyScheme(scheme, resolvedTheme === "dark");
  }, [schemeId, resolvedTheme]);

  const setSchemeId = (id: ColorSchemeId) => {
    setSchemeIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  const scheme = colorSchemes.find((s) => s.id === schemeId) ?? colorSchemes[0];

  return (
    <ColorSchemeContext.Provider value={{ schemeId, scheme, setSchemeId, schemes: colorSchemes }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error("useColorScheme must be used within ColorSchemeProvider");
  return ctx;
}
