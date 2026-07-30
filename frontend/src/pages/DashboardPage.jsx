import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Award, BarChart3, Calendar, Flame, Star, Target, Trophy, Zap } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import Heatmap from "../components/Heatmap.jsx";
import ProblemTable from "../components/ProblemTable.jsx";
import RankBadge from "../components/RankBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { problemApi } from "../services/api.js";
import { winRate, levelProgress, rankProgress, rankInfo, nextRankElo } from "../utils/ranks.js";

const ACHIEVEMENTS_DISPLAY = [
  { key: "FIRST_BLOOD", icon: "🩸", label: "First Blood",  color: "#FF0055" },
  { key: "SPEED_DEMON",  icon: "⚡", label: "Speed Demon",  color: "#FFD700" },
  { key: "BUG_HUNTER",  icon: "🐛", label: "Bug Hunter",   color: "#00FF88" },
  { key: "JAVA_MASTER", icon: "☕", label: "Java Master",  color: "#00E5FF" },
  { key: "CENTURION",   icon: "💯", label: "100 Battles",  color: "#9D4EDD" },
  { key: "ROOKIE",      icon: "🌟", label: "Rookie",       color: "#94a3b8" },
];

const SKILLS = [
  { name: "Arrays & Hashing", pct: 82 },
  { name: "Dynamic Programming", pct: 68 },
  { name: "Graph Algorithms", pct: 54 },
  { name: "Trees & Recursion", pct: 74 },
  { name: "Debugging", pct: 60 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    problemApi.list().then(({ data }) => setProblems(data.problems)).catch(() => setProblems([]));
  }, []);

  const lp = levelProgress(user?.xp ?? 80);
  const rProgress = rankProgress(user?.elo ?? 1000);
  const nextElo = nextRankElo(user?.elo ?? 1000);
  const rInfo = rankInfo(user?.rank ?? "Bronze");
  const unlockedKeys = new Set(user?.achievements?.map((a) => a.key) ?? ["ROOKIE"]);

  return (
    <section>
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Command Center</p>
          <h1 className="mt-1 font-display text-4xl font-black">
            Welcome back,{" "}
            <span className="text-arena-cyan" style={{ textShadow: "0 0 20px rgba(0,229,255,0.5)" }}>
              {user?.username}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </motion.div>
        <div className="flex gap-2">
          <button
            id="queue-ranked-btn"
            onClick={() => navigate("/battles")}
            className="btn btn-primary gap-2"
          >
            <Zap size={16} /> Queue Ranked
          </button>
          <button
            onClick={() => navigate("/arena/demo")}
            className="btn btn-ghost gap-2"
          >
            <Activity size={16} /> Practice
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Current Rank"  value={user?.rank ?? "Bronze"} accent="gold"   icon={Trophy}   delay={0} />
        <StatCard label="ELO Rating"    value={user?.elo  ?? 1000}     accent="cyan"   icon={Star}     delay={0.05} />
        <StatCard label="Win Rate"      value={`${winRate(user)}%`}    accent="green"  icon={Target}   delay={0.1} />
        <StatCard label="Battle Streak" value={`${user?.streak ?? 0}d`}accent="red"    icon={Flame}    delay={0.15} />
        <StatCard label="Level"         value={`Lv.${lp.level}`}      accent="purple" icon={BarChart3} delay={0.2}
          sub={`${lp.progress}/${lp.required} XP`}
        />
      </div>

      {/* XP + Rank Progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-5 glass rounded-xl p-5 grid gap-6 md:grid-cols-2"
      >
        {/* XP Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">Level {lp.level}</span>
            <span className="text-slate-400">{lp.progress} / {lp.required} XP</span>
          </div>
          <div className="h-3 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lp.percent}%` }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              className="xp-bar-fill"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{lp.required - lp.progress} XP until Level {lp.level + 1}</p>
        </div>

        {/* Rank Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <RankBadge rank={user?.rank ?? "Bronze"} size="sm" />
            </div>
            <span className="text-slate-400">
              {nextElo ? `${user?.elo ?? 1000} / ${nextElo} ELO` : "Max Rank 🔱"}
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rProgress}%` }}
              transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full transition-all"
              style={{ background: rInfo.color, boxShadow: `0 0 10px ${rInfo.color}80` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {nextElo ? `${nextElo - (user?.elo ?? 1000)} ELO to next rank` : "Grandmaster — Peak"}
          </p>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <ProblemTable problems={problems} />

        <div className="space-y-5">
          {/* Skill Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-arena-cyan" /> Skill Analysis
            </h3>
            <div className="space-y-3">
              {SKILLS.map(({ name, pct }, i) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{name}</span>
                    <span className="text-arena-cyan font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-arena-cyan to-arena-purple"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <Award size={16} className="text-arena-gold" /> Achievements
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ACHIEVEMENTS_DISPLAY.map(({ key, icon, label, color }) => {
                const unlocked = unlockedKeys.has(key);
                return (
                  <div
                    key={key}
                    title={label}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all cursor-default ${
                      unlocked ? "glass" : "opacity-30 grayscale"
                    }`}
                    style={unlocked ? { border: `1px solid ${color}33`, background: `${color}0d` } : {}}
                  >
                    <span className="text-2xl">{icon}</span>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: unlocked ? color : "#666" }}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-6">
        <Heatmap />
      </div>

      {/* Upcoming Tournaments */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 glass rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold flex items-center gap-2">
            <Calendar size={16} className="text-arena-purple" /> Upcoming Tournaments
          </h3>
          <button onClick={() => navigate("/tournaments")} className="text-xs text-arena-cyan hover:underline">
            View All →
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { name: "Weekly Sprint", date: "Aug 2", prize: "500 XP", diff: "Medium" },
            { name: "DSA Championship", date: "Aug 9", prize: "2000 XP", diff: "Hard" },
            { name: "Placement Prep", date: "Aug 15", prize: "1000 XP", diff: "Easy" },
          ].map(({ name, date, prize, diff }) => (
            <div key={name} className="rounded-xl border border-white/8 bg-white/3 p-4 hover:border-arena-cyan/30 transition-colors cursor-pointer"
              onClick={() => navigate("/tournaments")}>
              <p className="font-display font-bold text-sm">{name}</p>
              <p className="text-xs text-slate-400 mt-1">{date} · {diff}</p>
              <p className="text-xs text-arena-gold mt-2 font-semibold">🏆 {prize}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
