import { useState } from "react";
import { motion } from "framer-motion";
import { Award, BarChart3, Camera, Edit3, Save, Shield, Swords, Trophy, X, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../services/api.js";
import RankBadge from "../components/RankBadge.jsx";
import { levelProgress, rankProgress, rankInfo, nextRankElo, winRate } from "../utils/ranks.js";

const RECENT_BATTLES = [
  { id: "1", opponent: "CodeNinja",  result: "win",  problem: "Two Sum",      diff: "Easy",   elo: "+25", time: "12:43" },
  { id: "2", opponent: "AlgoWizard", result: "loss", problem: "House Robber", diff: "Medium", elo: "-15", time: "28:01" },
  { id: "3", opponent: "ByteMaster", result: "win",  problem: "Valid Parentheses", diff: "Easy", elo: "+25", time: "8:22" },
  { id: "4", opponent: "TopKoder",   result: "loss", problem: "Coin Change",  diff: "Medium", elo: "-15", time: "30:00" },
  { id: "5", opponent: "DevPanda",   result: "win",  problem: "Binary Search",diff: "Beginner",elo: "+25", time: "4:11" },
];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username ?? "", favoriteLanguage: user?.favoriteLanguage ?? "Java" });
  const [saving, setSaving] = useState(false);

  const lp = levelProgress(user?.xp ?? 80);
  const rProgress = rankProgress(user?.elo ?? 1000);
  const rInfo = rankInfo(user?.rank ?? "Bronze");
  const nextElo = nextRankElo(user?.elo ?? 1000);
  const wRate = winRate(user);
  const unlockedKeys = new Set(user?.achievements?.map((a) => a.key) ?? ["ROOKIE"]);

  async function save() {
    setSaving(true);
    try {
      const { data } = await authApi.update(form);
      setUser?.(data.user);
      setEditing(false);
    } catch {}
    setSaving(false);
  }

  const ACHIEV_DISPLAY = [
    { key: "ROOKIE",      icon: "🌟", label: "Rookie",      color: "#94a3b8" },
    { key: "FIRST_BLOOD", icon: "🩸", label: "First Blood",  color: "#FF0055" },
    { key: "SPEED_DEMON", icon: "⚡", label: "Speed Demon",  color: "#FFD700" },
    { key: "BUG_HUNTER",  icon: "🐛", label: "Bug Hunter",   color: "#00FF88" },
    { key: "JAVA_MASTER", icon: "☕", label: "Java Master",  color: "#00E5FF" },
    { key: "CENTURION",   icon: "💯", label: "100 Battles",  color: "#9D4EDD" },
  ];

  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Arena Identity</p>
        <h1 className="mt-1 font-display text-4xl font-black">My Profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* Profile Card */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 text-center"
            style={{ border: "1px solid rgba(0,229,255,0.12)", boxShadow: "0 0 30px rgba(0,229,255,0.05)" }}
          >
            {/* Avatar */}
            <div className="relative mx-auto mb-4 h-24 w-24">
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center font-display text-4xl font-black"
                style={{
                  background: "linear-gradient(135deg, rgba(0,229,255,0.25), rgba(157,78,221,0.25))",
                  border: "2px solid rgba(0,229,255,0.4)",
                  boxShadow: "0 0 24px rgba(0,229,255,0.2)",
                }}
              >
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-arena-cyan p-1.5 text-arena-bg hover:bg-[#33ecff] transition-all">
                <Camera size={12} />
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-center outline-none focus:border-arena-cyan"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <select
                  className="w-full rounded-xl border border-white/10 bg-arena-bg px-3 py-2.5 text-sm"
                  value={form.favoriteLanguage}
                  onChange={(e) => setForm({ ...form, favoriteLanguage: e.target.value })}
                >
                  <option>Java</option>
                  <option>C++</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={save} disabled={saving} className="btn btn-primary flex-1 py-2 text-xs gap-1">
                    <Save size={12} /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn btn-ghost flex-1 py-2 text-xs">
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-black">{user?.username}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                  <RankBadge rank={user?.rank ?? "Bronze"} size="md" />
                  <span className="text-xs text-arena-cyan bg-arena-cyan/10 border border-arena-cyan/20 px-2 py-0.5 rounded">
                    {user?.favoriteLanguage ?? "Java"}
                  </span>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-ghost mt-4 w-full py-2 text-xs gap-1.5"
                >
                  <Edit3 size={12} /> Edit Profile
                </button>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <BarChart3 size={14} className="text-arena-cyan" /> Stats
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                ["ELO Rating",   user?.elo ?? 1000,           "text-arena-cyan"],
                ["Wins",         user?.wins ?? 0,             "text-arena-green"],
                ["Losses",       user?.losses ?? 0,           "text-arena-red"],
                ["Win Rate",     `${wRate}%`,                 "text-arena-gold"],
                ["Level",        `${lp.level}`,               "text-arena-purple"],
                ["Total XP",     user?.xp ?? 0,               "text-white"],
                ["Streak",       `${user?.streak ?? 0} days`, "text-arena-cyan"],
              ].map(([label, val, cls]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-display font-bold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>

            {/* Rank progress */}
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">Rank Progress</span>
                <span className="text-slate-400">{rProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rProgress}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full rounded-full"
                  style={{ background: rInfo.color }}
                />
              </div>
              {nextElo && <p className="text-xs text-slate-600 mt-1">{nextElo - (user?.elo ?? 1000)} ELO to next rank</p>}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
              <Award size={15} className="text-arena-gold" /> Achievements
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {ACHIEV_DISPLAY.map(({ key, icon, label, color }) => {
                const unlocked = unlockedKeys.has(key);
                return (
                  <div
                    key={key}
                    title={label}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                      unlocked ? "" : "opacity-25 grayscale"
                    }`}
                    style={unlocked ? { background: `${color}0d`, border: `1px solid ${color}33` } : { border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-3xl">{icon}</span>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide leading-tight" style={{ color: unlocked ? color : "#555" }}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Battle History */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <Swords size={15} className="text-arena-red" />
              <h3 className="font-display font-bold text-base">Battle History</h3>
            </div>
            <div className="divide-y divide-white/5">
              {RECENT_BATTLES.map((b) => (
                <div key={b.id} className="arena-row px-5 py-3.5 flex items-center gap-4">
                  <div
                    className={`w-1.5 h-10 rounded-full flex-shrink-0 ${b.result === "win" ? "bg-arena-green" : "bg-arena-red"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{b.problem}</p>
                    <p className="text-xs text-slate-500">vs {b.opponent} · {b.diff}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-display font-bold text-sm ${b.result === "win" ? "text-arena-green" : "text-arena-red"}`}>
                      {b.elo}
                    </p>
                    <p className="text-xs text-slate-500 mono">{b.time}</p>
                  </div>
                  <div>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${b.result === "win" ? "bg-arena-green/15 text-arena-green" : "bg-arena-red/15 text-arena-red"}`}>
                      {b.result === "win" ? "W" : "L"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
