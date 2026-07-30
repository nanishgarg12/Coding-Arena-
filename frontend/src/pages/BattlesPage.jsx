import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, Filter, Lock, Plus, Radio, RefreshCw, Search, Shield, Swords, Users
} from "lucide-react";
import { battleApi } from "../services/api.js";
import RankBadge from "../components/RankBadge.jsx";

const SETTINGS_FIELDS = [
  { key: "visibility",      label: "Room Type",   options: ["public", "private"] },
  { key: "battleType",      label: "Battle Type", options: ["1 VS 1", "2 VS 2 Team Battle", "3 VS 3 Team Battle", "Tournament"] },
  { key: "maxPlayers",      label: "Players",     options: [2, 4, 6, 8] },
  { key: "difficulty",      label: "Difficulty",  options: ["Beginner", "Easy", "Medium", "Hard", "Expert"] },
  { key: "durationMinutes", label: "Duration",    options: [15, 30, 45, 60], suffix: " min" },
  { key: "category",        label: "Category",    options: ["ARRAY", "STRING", "GRAPH", "DP", "BACKTRACKING", "TREE", "STACK", "SQL", "Debugging", "Frontend", "System Design"] },
];

const DIFF_COLORS = {
  Beginner: "text-slate-400", Easy: "text-arena-green", Medium: "text-arena-gold",
  Hard: "text-arena-red", Expert: "text-arena-purple"
};

const initialSettings = {
  visibility: "public", battleType: "1 VS 1", maxPlayers: 2,
  difficulty: "Easy", durationMinutes: 30, languages: ["Java", "C++"], category: "ARRAY"
};

export default function BattlesPage() {
  const [battles, setBattles] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState({ diff: "All", type: "All" });
  const navigate = useNavigate();

  async function fetchBattles() {
    setRefreshing(true);
    try {
      const { data } = await battleApi.public();
      setBattles(data.battles ?? []);
    } catch {
      setBattles([]);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchBattles(); }, []);

  async function createBattle() {
    setLoading(true);
    try {
      const { data } = await battleApi.create(settings);
      navigate(`/lobby/${data.battle.roomCode}`);
    } catch { setLoading(false); }
  }

  async function join(roomCode) {
    try {
      await battleApi.join(roomCode);
      navigate(`/lobby/${roomCode}`);
    } catch {}
  }

  async function joinPrivate() {
    if (!joinCode.trim()) return;
    await join(joinCode.trim().toUpperCase());
  }

  const displayed = battles.filter((b) => {
    if (filter.diff !== "All" && b.difficulty !== filter.diff) return false;
    if (filter.type !== "All" && b.battleType !== filter.type) return false;
    return true;
  });

  return (
    <section>
      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Live Battle Arena</p>
        <h1 className="mt-1 font-display text-4xl font-black">Create or Join a Fight</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* LEFT: Room Creator */}
        <div className="space-y-4">
          <div
            className="glass rounded-xl p-5"
            style={{ border: "1px solid rgba(255,0,85,0.15)", boxShadow: "0 0 24px rgba(255,0,85,0.05)" }}
          >
            <h2 className="font-display text-xl font-black mb-5 flex items-center gap-2">
              <Swords size={18} className="text-arena-red" /> Room Settings
            </h2>

            <div className="space-y-3">
              {SETTINGS_FIELDS.map(({ key, label, options, suffix }) => (
                <div key={key}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                    {label}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSettings((s) => ({
                          ...s,
                          [key]: (key === "maxPlayers" || key === "durationMinutes") ? Number(opt) : opt
                        }))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-150 ${
                          settings[key] === opt || settings[key] === Number(opt)
                            ? "bg-arena-red/15 border-arena-red/50 text-arena-red"
                            : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {opt}{suffix ?? ""}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              id="create-battle-btn"
              onClick={createBattle}
              disabled={loading}
              className="btn btn-danger mt-5 w-full py-3 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating…
                </span>
              ) : (
                <><Plus size={16} /> Create Battle Room</>
              )}
            </button>
          </div>

          {/* Private room join */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Lock size={14} className="text-arena-gold" /> Join Private Room
            </h3>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm mono uppercase placeholder:normal-case placeholder:text-slate-600 outline-none focus:border-arena-cyan transition-all"
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinPrivate()}
              />
              <button onClick={joinPrivate} className="btn btn-ghost px-3">
                <Radio size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Battles */}
        <div>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-slate-500" />
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button key={d} onClick={() => setFilter((f) => ({ ...f, diff: d }))}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold border transition-all ${filter.diff === d ? "border-arena-cyan/50 bg-arena-cyan/10 text-arena-cyan" : "border-white/10 text-slate-500 hover:text-white"}`}>
                  {d}
                </button>
              ))}
            </div>
            <button onClick={fetchBattles} disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-arena-cyan transition-colors">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {/* Battle List */}
          <div className="space-y-3">
            {displayed.map((battle, i) => (
              <motion.div
                key={battle._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 hover:border-arena-cyan/20 transition-all duration-200 group"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-xs text-arena-cyan font-semibold bg-arena-cyan/10 px-2 py-0.5 rounded border border-arena-cyan/20">
                        {battle.roomCode}
                      </span>
                      <span className={`text-xs font-semibold ${DIFF_COLORS[battle.difficulty] ?? "text-slate-400"}`}>
                        {battle.difficulty}
                      </span>
                      <span className="text-xs text-slate-500">{battle.battleType}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold truncate group-hover:text-arena-cyan transition-colors">
                      {battle.problem?.title ?? "Mystery Problem"}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Shield size={11} /> Host: {battle.host?.username ?? "Unknown"}
                      </span>
                      <RankBadge rank={battle.host?.rank ?? "Bronze"} size="xs" showIcon={false} />
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {battle.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Users size={13} className="text-slate-400" />
                        <span className="text-arena-cyan">{battle.participants?.length}</span>
                        <span className="text-slate-500">/{battle.maxPlayers}</span>
                      </div>
                      <div className="mt-1 h-1 w-16 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-arena-cyan rounded-full"
                          style={{ width: `${((battle.participants?.length ?? 0) / battle.maxPlayers) * 100}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => join(battle.roomCode)}
                      className="btn btn-ghost border-arena-cyan/40 text-arena-cyan hover:bg-arena-cyan hover:text-arena-bg gap-1.5"
                    >
                      <Radio size={14} /> Join
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {!displayed.length && !refreshing && (
              <div className="glass rounded-xl p-12 text-center">
                <Swords size={40} className="mx-auto mb-4 text-slate-700" />
                <p className="text-slate-400 font-semibold">No active battles in the arena</p>
                <p className="text-sm text-slate-600 mt-1">Be the first to create a room!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
