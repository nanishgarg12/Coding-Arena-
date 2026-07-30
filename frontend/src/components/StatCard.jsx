import { motion } from "framer-motion";

const ACCENT_STYLES = {
  cyan:   { icon: null, gradient: "stat-cyan",   text: "text-arena-cyan" },
  red:    { icon: null, gradient: "stat-red",    text: "text-arena-red" },
  green:  { icon: null, gradient: "stat-green",  text: "text-arena-green" },
  gold:   { icon: null, gradient: "stat-gold",   text: "text-arena-gold" },
  purple: { icon: null, gradient: "stat-purple", text: "text-arena-purple" },
};

export default function StatCard({ label, value, sub, accent = "cyan", icon: Icon, delay = 0 }) {
  const style = ACCENT_STYLES[accent] ?? ACCENT_STYLES.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`glass rounded-xl p-5 ${style.gradient} relative overflow-hidden`}
    >
      {/* Decorative glow corner */}
      <div
        className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl"
        style={{ background: "currentColor" }}
      />

      {Icon && (
        <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ${style.text}`}>
          <Icon size={18} />
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-1.5 font-display text-3xl font-black ${style.text}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}
