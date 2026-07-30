import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, TrendingDown, TrendingUp, Zap } from "lucide-react";
import RankBadge from "./RankBadge.jsx";

function Confetti() {
  const pieces = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    color: ["#00E5FF", "#FF0055", "#00FF88", "#FFD700", "#9D4EDD"][Math.floor(Math.random() * 5)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in both`,
          }}
        />
      ))}
    </div>
  );
}

export default function WinnerModal({ isWinner, eloDelta, xpGained, opponentName, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 9000);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = isWinner ? "#00FF88" : "#FF0055";
  const glowColor = isWinner
    ? "rgba(0,255,136,0.5)"
    : "rgba(255,0,85,0.5)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(5,8,22,0.88)", backdropFilter: "blur(16px)" }}
          onClick={() => { setVisible(false); onClose?.(); }}
        >
          {isWinner && <Confetti />}

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative mx-4 max-w-md w-full rounded-2xl p-8 text-center"
            style={{
              border: `1px solid ${color}44`,
              boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}44`,
            }}
          >
            {/* Icon */}
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: `${color}18`, border: `2px solid ${color}55`, boxShadow: `0 0 20px ${glowColor}` }}
            >
              <Trophy size={36} style={{ color }} />
            </div>

            {/* Result */}
            <p
              className="font-display text-5xl font-black uppercase tracking-wide"
              style={{ color, textShadow: `0 0 20px ${glowColor}` }}
            >
              {isWinner ? "VICTORY!" : "DEFEAT"}
            </p>

            <p className="mt-2 text-slate-400 text-sm">
              {isWinner
                ? `You defeated ${opponentName || "your opponent"}!`
                : `${opponentName || "Opponent"} solved it faster.`}
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 text-sm text-slate-400">
                  {eloDelta >= 0 ? <TrendingUp size={14} className="text-arena-green" /> : <TrendingDown size={14} className="text-arena-red" />}
                  ELO Change
                </div>
                <p
                  className="mt-1 font-display text-2xl font-black"
                  style={{ color: eloDelta >= 0 ? "#00FF88" : "#FF0055" }}
                >
                  {eloDelta >= 0 ? "+" : ""}{eloDelta ?? (isWinner ? "+25" : "-15")}
                </p>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 text-sm text-slate-400">
                  <Zap size={14} className="text-arena-gold" />
                  XP Earned
                </div>
                <p className="mt-1 font-display text-2xl font-black text-arena-gold">
                  +{xpGained ?? (isWinner ? 120 : 45)}
                </p>
              </div>
            </div>

            <button
              onClick={() => { setVisible(false); onClose?.(); }}
              className="btn btn-ghost mt-6 w-full"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
