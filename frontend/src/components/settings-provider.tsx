import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";

type AppSettings = {
  reduceMotion: boolean;
  compactTables: boolean;
  setReduceMotion: (v: boolean) => void;
  setCompactTables: (v: boolean) => void;
};

const Ctx = createContext<AppSettings | null>(null);

const STORAGE_KEY = "maverick.settings.v1";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [compactTables, setCompactTablesState] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.reduceMotion === "boolean")
          setReduceMotionState(parsed.reduceMotion);
        if (typeof parsed.compactTables === "boolean")
          setCompactTablesState(parsed.compactTables);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ reduceMotion, compactTables })
      );
    } catch {}
    const root = document.documentElement;
    root.dataset.reduceMotion = reduceMotion ? "true" : "false";
    root.dataset.compactTables = compactTables ? "true" : "false";
  }, [reduceMotion, compactTables]);

  return (
    <Ctx.Provider
      value={{
        reduceMotion,
        compactTables,
        setReduceMotion: setReduceMotionState,
        setCompactTables: setCompactTablesState,
      }}
    >
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        {children}
      </MotionConfig>
    </Ctx.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useAppSettings must be used within SettingsProvider");
  return ctx;
}
