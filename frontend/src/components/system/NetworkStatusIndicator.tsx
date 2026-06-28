import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

/** Hook + context for whether the browser thinks we're online. */
const NetworkStatusContext = createContext<boolean>(true);

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={online}>
      {children}
      <NetworkStatusBanner online={online} />
    </NetworkStatusContext.Provider>
  );
}

/** Read-only access to the current online state — handy for AI surfaces. */
export function useNetworkStatus(): boolean {
  return useContext(NetworkStatusContext);
}

/**
 * Top-of-screen banner that appears whenever the browser is offline, plus a
 * brief "Back online" toast when connectivity returns.
 */
function NetworkStatusBanner({ online }: { online: boolean }) {
  const [showRestored, setShowRestored] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!online) {
      setHasBeenOffline(true);
      setShowRestored(false);
    } else if (hasBeenOffline) {
      setShowRestored(true);
      const t = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(t);
    }
  }, [online, hasBeenOffline]);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 inset-x-0 z-[150] flex justify-center px-4 pt-2"
          role="status"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive text-destructive-foreground px-4 py-1.5 shadow-lg text-xs font-medium">
            <WifiOff className="h-3.5 w-3.5" />
            <span>You're offline. AI features and live data are paused until your connection is back.</span>
          </div>
        </motion.div>
      )}

      {online && showRestored && (
        <motion.div
          key="restored"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 inset-x-0 z-[150] flex justify-center px-4 pt-2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-600 text-white px-4 py-1.5 shadow-lg text-xs font-medium">
            <Wifi className="h-3.5 w-3.5" />
            <span>Back online — AI features are ready to use again.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Small inline pill that AI surfaces can drop next to a Send / Generate button
 * to make the offline state visible right where users will hit it.
 */
export function AIOfflineBadge({ className = "" }: { className?: string }) {
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-[11px] font-medium px-2 py-0.5 ${className}`}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-3 w-3" />
      AI paused — offline
    </span>
  );
}
