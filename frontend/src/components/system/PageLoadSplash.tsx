import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Brand splash shown on first paint while the app's chunks finish loading.
 * Auto-dismisses after a short minimum delay so users always see the brand
 * mark instead of an unstyled flash on slow networks.
 */
export function PageLoadSplash({ minDurationMs = 600 }: { minDurationMs?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Once the React tree has mounted we know the JS bundle has loaded, so
    // hold the splash just long enough for the brand mark to register, then
    // fade out — no need to wait for the slow `window.load` event.
    const t = setTimeout(() => setVisible(false), minDurationMs);
    return () => clearTimeout(t);
  }, [minDurationMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          aria-hidden={!visible}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative h-16 w-16"
            >
              {/* Glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl ai-icon"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(99,102,241,0.0)",
                    "0 0 28px 4px rgba(99,102,241,0.45)",
                    "0 0 0 0 rgba(99,102,241,0.0)",
                  ],
                }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <div className="absolute inset-0 rounded-2xl ai-icon flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </motion.div>

            <div className="text-center">
              <div className="text-lg font-semibold ai-gradient-text">
                Maverick Execution Platform
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Loading your workspace…
              </div>
            </div>

            {/* Animated progress dots */}
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
