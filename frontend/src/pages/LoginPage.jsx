import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Zap, Shield, Trophy, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const RANKS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"];
const RANK_COLORS = {
  Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#FFD700",
  Platinum: "#00E5FF", Diamond: "#b9f2ff", Master: "#9D4EDD", Grandmaster: "#FF0055"
};

const STATS = [
  { label: "Active Battles", value: "2,847", icon: Zap },
  { label: "Registered Coders", value: "128K+", icon: Users },
  { label: "Problems", value: "51", icon: Shield },
  { label: "Tournaments", value: "340+", icon: Trophy },
];

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", favoriteLanguage: "Java", role: "player" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rankIdx, setRankIdx] = useState(0);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Cycle rank showcase
  useEffect(() => {
    const t = setInterval(() => setRankIdx((i) => (i + 1) % RANKS.length), 2000);
    return () => clearInterval(t);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const currentRank = RANKS[rankIdx];
  const rankColor = RANK_COLORS[currentRank];

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12 battle-grid relative overflow-hidden"
      style={{ background: "#050816" }}
    >
      {/* Radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #FF0055 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-3xl opacity-5"
          style={{ background: "radial-gradient(circle, #9D4EDD 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.3fr_0.7fr]">

        {/* ---- HERO SIDE ---- */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-arena-red mb-4">
            ⚔️ AI Powered Competitive Coding
          </p>
          <h1
            className="font-display font-black leading-tight"
            style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
          >
            Code
            <span
              style={{ color: "#00E5FF", textShadow: "0 0 30px rgba(0,229,255,0.6)" }}
            >Arena</span>
          </h1>
          <p className="mt-2 text-xl font-semibold text-slate-400">
            The Valorant of Competitive Programming
          </p>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-400">
            Real-time coding battles. Ranked duels. AI coaching. Tournament-grade competition rooms with integrity monitoring.
          </p>

          {/* Rank Showcase */}
          <div className="mt-8 flex items-center gap-4">
            <p className="text-sm text-slate-500 uppercase tracking-widest">Current Spotlight:</p>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentRank}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-display text-xl font-black uppercase tracking-wider"
                style={{ color: rankColor, textShadow: `0 0 16px ${rankColor}88` }}
              >
                {currentRank}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Rank Tier Bars */}
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {RANKS.map((r, i) => (
              <div key={r} className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-full rounded-sm transition-all duration-500"
                  style={{
                    background: RANK_COLORS[r],
                    opacity: i <= rankIdx ? 0.9 : 0.15,
                    boxShadow: i === rankIdx ? `0 0 12px ${RANK_COLORS[r]}` : "none",
                    height: `${20 + i * 8}px`,
                  }}
                />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{r[0]}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-3 text-center">
                <Icon size={16} className="mx-auto mb-1 text-arena-cyan" />
                <p className="font-display text-lg font-black text-white">{value}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ---- AUTH CARD ---- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="glass rounded-2xl p-7 shadow-neon"
          style={{ border: "1px solid rgba(0,229,255,0.15)", boxShadow: "0 0 40px rgba(0,229,255,0.08)" }}
        >
          {/* Tab toggle */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
            <button
              type="button"
              id="login-tab"
              onClick={() => setMode("login")}
              className={`rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                mode === "login"
                  ? "bg-arena-cyan text-arena-bg shadow-neon"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn size={14} className="inline mr-1.5" />Login
            </button>
            <button
              type="button"
              id="register-tab"
              onClick={() => setMode("register")}
              className={`rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                mode === "register"
                  ? "bg-arena-red text-white shadow-danger"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus size={14} className="inline mr-1.5" />Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <input
                    id="username-input"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-arena-cyan focus:ring-1 focus:ring-arena-cyan/30 transition-all placeholder:text-slate-600"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required={mode === "register"}
                    minLength={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              id="email-input"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-arena-cyan focus:ring-1 focus:ring-arena-cyan/30 transition-all placeholder:text-slate-600"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              id="password-input"
              type="password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-arena-cyan focus:ring-1 focus:ring-arena-cyan/30 transition-all placeholder:text-slate-600"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />

            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block uppercase tracking-wider">Language</label>
                      <select
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
                        value={form.favoriteLanguage}
                        onChange={(e) => setForm({ ...form, favoriteLanguage: e.target.value })}
                      >
                        <option value="Java">Java</option>
                        <option value="C++">C++</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block uppercase tracking-wider">Role</label>
                      <select
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                      >
                        <option value="player">Player</option>
                        <option value="recruiter">Recruiter</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-arena-red/40 bg-arena-red/10 p-3 text-sm text-arena-red"
              >
                {error}
              </motion.p>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className={`btn w-full py-3 text-sm font-black ${
                mode === "login" ? "btn-primary" : "btn-danger"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Entering Arena…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {mode === "login" ? "Enter Arena" : "Create Account"}
                </span>
              )}
            </button>
          </form>

          {/* Demo Button */}
          <div className="mt-4 text-center">
            <button
              id="demo-btn"
              onClick={() => navigate("/arena/demo")}
              className="text-xs text-slate-500 hover:text-arena-cyan transition-colors underline underline-offset-2"
            >
              Try demo arena without login →
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
