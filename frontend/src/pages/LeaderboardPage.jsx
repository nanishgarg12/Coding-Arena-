import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Search, TrendingDown, TrendingUp } from "lucide-react";
import { leaderboardApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import RankBadge from "../components/RankBadge.jsx";
import { winRate } from "../utils/ranks.js";

const PODIUM_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("all");

  useEffect(() => {
    leaderboardApi.list()
      .then(({ data }) => setPlayers(data.players ?? []))
      .catch(() => setPlayers([]));
  }, []);

  const filtered = players.filter((p) =>
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Global Rankings</p>
        <h1 className="mt-1 font-display text-4xl font-black">Leaderboard</h1>
      </div>

      {/* Season Toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["all", "season"].map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                season === s
                  ? "bg-arena-cyan/15 border border-arena-cyan/40 text-arena-cyan"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {s === "all" ? "All Time" : "This Season"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-60 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-arena-cyan transition-all placeholder:text-slate-600"
            placeholder="Search player…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Podium — Top 3 */}
      {top3.length >= 3 && (
        <div className="mb-8 flex items-end justify-center gap-4">
          {[top3[1], top3[0], top3[2]].map((p, idx) => {
            const rank = [2, 1, 3][idx];
            const height = [130, 160, 110][idx];
            const color = PODIUM_COLORS[rank - 1];
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center gap-2"
              >
                {/* Avatar */}
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center font-display text-xl font-black"
                  style={{
                    background: `${color}22`,
                    border: `2px solid ${color}66`,
                    boxShadow: `0 0 16px ${color}44`,
                  }}
                >
                  {p.username?.[0]?.toUpperCase()}
                </div>
                <p className="text-xs font-bold text-center truncate max-w-[80px]">{p.username}</p>
                <p className="text-xs font-semibold" style={{ color }}>{p.elo} ELO</p>

                {/* Podium block */}
                <div
                  className="w-24 rounded-t-xl flex items-center justify-center text-2xl font-black"
                  style={{
                    height,
                    background: `linear-gradient(to top, ${color}33, ${color}11)`,
                    border: `1px solid ${color}44`,
                    color,
                  }}
                >
                  #{rank}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="border-b border-white/5 px-5 py-3 grid grid-cols-[40px_1fr_100px_100px_80px_80px] gap-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>#</span>
          <span>Player</span>
          <span>Rank</span>
          <span>ELO</span>
          <span>Win%</span>
          <span>Battles</span>
        </div>
        <div>
          {(search ? filtered : rest).map((p, i) => {
            const isMe = p._id === user?._id;
            const pos = search ? i + 1 : i + 4;
            const wRate = winRate(p);
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                className={`arena-row border-b border-white/5 px-5 py-3.5 grid grid-cols-[40px_1fr_100px_100px_80px_80px] gap-3 items-center transition-all ${
                  isMe ? "bg-arena-cyan/5 border-arena-cyan/15" : ""
                }`}
              >
                <span className={`font-display font-black text-sm ${pos <= 3 ? "" : "text-slate-500"}`}
                  style={{ color: pos <= 3 ? PODIUM_COLORS[pos - 1] : undefined }}>
                  {pos}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-xs"
                    style={{ background: "rgba(0,229,255,0.1)", border: "1.5px solid rgba(0,229,255,0.2)" }}
                  >
                    {p.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? "text-arena-cyan" : ""}`}>
                      {p.username} {isMe && <span className="text-xs text-arena-cyan/70">(You)</span>}
                    </p>
                    <p className="text-xs text-slate-500">Lv.{p.level ?? 1}</p>
                  </div>
                </div>
                <div><RankBadge rank={p.rank ?? "Bronze"} size="xs" /></div>
                <p className="font-display font-bold text-arena-cyan">{p.elo ?? 1000}</p>
                <div className="flex items-center gap-1">
                  {wRate >= 50
                    ? <TrendingUp size={12} className="text-arena-green" />
                    : <TrendingDown size={12} className="text-arena-red" />}
                  <span className={`text-sm font-semibold ${wRate >= 50 ? "text-arena-green" : "text-slate-400"}`}>
                    {wRate}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">{(p.wins ?? 0) + (p.losses ?? 0)}</p>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Medal size={32} className="mx-auto mb-3 text-slate-700" />
              No players found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
