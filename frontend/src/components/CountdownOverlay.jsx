import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * CountdownOverlay
 * Props:
 *   value       — optional: socket-driven countdown value (3|2|1|"FIGHT")
 *   onComplete  — called when countdown finishes (FIGHT shown)
 */
export default function CountdownOverlay({ value, onComplete }) {
  // Internal self-driven countdown (used when no socket value is provided)
  const [internalCount, setInternalCount] = useState(3);
  const [phase, setPhase] = useState("counting"); // counting | fight | done

  // Socket-driven mode: update display from value prop
  const isFight = value === "FIGHT" || phase === "fight";
  const displayCount =
    value !== undefined && value !== "FIGHT"
      ? Number(value)
      : internalCount;

  useEffect(() => {
    // If parent passes socket values, trust those instead of internal timer
    if (value !== undefined) {
      if (value === "FIGHT") {
        setPhase("fight");
        // onComplete is handled by parent (LobbyPage navigates after delay)
      } else {
        setPhase("counting");
        setInternalCount(Number(value));
      }
      return;
    }

    // Fallback self-driven countdown
    let tick = 3;
    const interval = setInterval(() => {
      tick -= 1;
      if (tick > 0) {
        setInternalCount(tick);
      } else if (tick === 0) {
        setPhase("fight");
        setInternalCount(0);
      } else {
        clearInterval(interval);
        setPhase("done");
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [value]); // eslint-disable-line

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(5,8,22,0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 battle-grid opacity-30" />

      <div className="relative">
        <AnimatePresence mode="wait">
          {!isFight ? (
            <motion.div
              key={displayCount}
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              {/* Outer glow ring */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "clamp(180px,40vw,280px)",
                  height: "clamp(180px,40vw,280px)",
                  border: "2px solid rgba(0,229,255,0.5)",
                  boxShadow:
                    "0 0 40px rgba(0,229,255,0.4), inset 0 0 40px rgba(0,229,255,0.1)",
                }}
              />
              <span
                className="countdown-number text-arena-cyan"
                style={{ fontSize: "clamp(6rem,18vw,11rem)" }}
              >
                {displayCount}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="fight"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="text-center"
            >
              <p
                className="font-display font-black uppercase tracking-[0.25em]"
                style={{
                  fontSize: "clamp(4rem,14vw,8rem)",
                  color: "#FF0055",
                  textShadow:
                    "0 0 30px rgba(255,0,85,0.8), 0 0 60px rgba(255,0,85,0.4)",
                }}
              >
                FIGHT!
              </p>
              <p className="mt-2 text-lg uppercase tracking-widest text-slate-400">
                Battle Started
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isFight && (
        <motion.p
          key={`sub-${displayCount}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-lg uppercase tracking-[0.3em] text-slate-400"
        >
          Get Ready
        </motion.p>
      )}
    </div>
  );
}
