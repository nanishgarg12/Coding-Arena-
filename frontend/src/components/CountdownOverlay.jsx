import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function CountdownOverlay({ onComplete }) {
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState("counting"); // counting | fight | done

  useEffect(() => {
    let tick = count;

    const interval = setInterval(() => {
      tick -= 1;
      if (tick > 0) {
        setCount(tick);
      } else if (tick === 0) {
        setPhase("fight");
      } else {
        clearInterval(interval);
        setPhase("done");
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(5,8,22,0.92)", backdropFilter: "blur(12px)" }}>
      {/* Grid background */}
      <div className="absolute inset-0 battle-grid opacity-30 pointer-events-none" />

      {/* Glow ring */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {phase === "counting" ? (
            <motion.div
              key={count}
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
                  boxShadow: "0 0 40px rgba(0,229,255,0.4), inset 0 0 40px rgba(0,229,255,0.1)",
                }}
              />
              <span
                className="countdown-number text-arena-cyan"
                style={{ fontSize: "clamp(6rem,18vw,11rem)" }}
              >
                {count}
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
                  textShadow: "0 0 30px rgba(255,0,85,0.8), 0 0 60px rgba(255,0,85,0.4)",
                }}
              >
                FIGHT!
              </p>
              <p className="mt-2 text-slate-400 text-lg uppercase tracking-widest">Battle Started</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sub text for counting */}
      {phase === "counting" && (
        <motion.p
          key={`sub-${count}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-slate-400 text-lg uppercase tracking-[0.3em]"
        >
          Get Ready
        </motion.p>
      )}
    </div>
  );
}
