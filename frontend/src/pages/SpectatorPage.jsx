import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Radio, Timer, Tv, Users } from "lucide-react";
import { battleApi } from "../services/api.js";
import { getSocket } from "../services/socket.js";
import { formatTimer } from "../utils/ranks.js";
import RankBadge from "../components/RankBadge.jsx";

const MOCK_LIVE = [
  { _id: "1", roomCode: "CA-82941", participants: [{ user: { username: "CodeNinja", rank: "Diamond", elo: 1750 } }, { user: { username: "AlgoWizard", rank: "Platinum", elo: 1520 } }], problem: { title: "Longest Substring Without Repeating Characters", difficulty: "Medium" }, timer: 1240, spectators: 12 },
  { _id: "2", roomCode: "CA-33571", participants: [{ user: { username: "ByteMaster", rank: "Gold", elo: 1380 } }, { user: { username: "GreenCoder", rank: "Silver", elo: 1180 } }], problem: { title: "Binary Tree Level Order Traversal", difficulty: "Medium" }, timer: 890, spectators: 4 },
  { _id: "3", roomCode: "CA-19042", participants: [{ user: { username: "GrandPanda", rank: "Grandmaster", elo: 2240 } }, { user: { username: "TopKoder", rank: "Master", elo: 1920 } }], problem: { title: "Edit Distance", difficulty: "Hard" }, timer: 560, spectators: 28 },
];

export default function SpectatorPage() {
  const [liveBattles, setLiveBattles] = useState([]);
  const [watching, setWatching] = useState(null);
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    battleApi.public()
      .then(({ data }) => {
        const live = data.battles?.filter((b) => b.status === "live") ?? [];
        setLiveBattles(live.length ? live : MOCK_LIVE);
      })
      .catch(() => setLiveBattles(MOCK_LIVE));
  }, []);

  function spectate(battle) {
    if (watching) socket.emit("leave:room", { roomCode: watching.roomCode });
    socket.emit("battle:spectate", { roomCode: battle.roomCode });
    setWatching(battle);
  }

  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Live Now</p>
        <h1 className="mt-1 font-display text-4xl font-black">Spectator Mode</h1>
        <p className="mt-1 text-sm text-slate-400">Watch live coding battles in real-time</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Live Battle List */}
        <div className="space-y-3">
          {liveBattles.map((battle, i) => {
            const p1 = battle.participants?.[0]?.user;
            const p2 = battle.participants?.[1]?.user;
            const isWatching = watching?._id === battle._id;

            return (
              <motion.div
                key={battle._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => spectate(battle)}
                className={`glass rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  isWatching ? "neon-border-cyan" : "hover:border-white/20"
                }`}
              >
                {/* Live badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-arena-red border border-arena-red/30 bg-arena-red/10 px-2 py-0.5 rounded animate-pulse">
                      ● LIVE
                    </span>
                    <span className="mono text-xs text-slate-500">{battle.roomCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={11} /> {battle.spectators ?? 0} watching
                  </div>
                </div>

                {/* Players */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 text-right">
                    <p className="font-display font-bold">{p1?.username ?? "Player 1"}</p>
                    <RankBadge rank={p1?.rank ?? "Bronze"} size="xs" showIcon={false} />
                  </div>
                  <div className="font-display text-xl font-black text-arena-red px-3">VS</div>
                  <div className="flex-1 text-left">
                    <p className="font-display font-bold">{p2?.username ?? "Player 2"}</p>
                    <RankBadge rank={p2?.rank ?? "Bronze"} size="xs" showIcon={false} />
                  </div>
                </div>

                {/* Problem */}
                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3">
                  <span className="text-slate-400 truncate flex-1">{battle.problem?.title ?? "Secret Problem"}</span>
                  <div className="flex items-center gap-1 text-slate-500 ml-3 flex-shrink-0">
                    <Timer size={12} />
                    <span className="mono text-xs">{formatTimer(battle.timer ?? 1200)}</span>
                  </div>
                </div>

                {isWatching && (
                  <div className="mt-3 text-xs text-center text-arena-cyan font-semibold">
                    <Eye size={12} className="inline mr-1" /> Currently watching
                  </div>
                )}
              </motion.div>
            );
          })}

          {!liveBattles.length && (
            <div className="glass rounded-xl p-12 text-center">
              <Tv size={40} className="mx-auto mb-4 text-slate-700" />
              <p className="text-slate-400 font-semibold">No live battles right now</p>
              <p className="text-sm text-slate-600 mt-1">Check back soon or start your own battle!</p>
            </div>
          )}
        </div>

        {/* Watching Panel */}
        <div>
          {watching ? (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-xl p-5 sticky top-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Radio size={14} className="text-arena-red animate-pulse" />
                <h3 className="font-display font-black">Now Spectating</h3>
              </div>

              <div className="text-center mb-4">
                <p className="font-display text-2xl font-black">
                  {watching.participants?.[0]?.user?.username}
                  <span className="text-arena-red mx-3">VS</span>
                  {watching.participants?.[1]?.user?.username}
                </p>
                <p className="text-sm text-slate-400 mt-1">{watching.problem?.title}</p>
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time Remaining</p>
                <p className="mono text-3xl font-black text-arena-cyan">
                  {formatTimer(watching.timer ?? 1200)}
                </p>
              </div>

              {/* Prediction */}
              <div className="glass-dark rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Win Prediction</p>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                  <div className="bg-arena-cyan rounded-l-full transition-all duration-1000"
                    style={{ width: "58%" }} title={watching.participants?.[0]?.user?.username} />
                  <div className="bg-arena-red rounded-r-full flex-1 transition-all duration-1000"
                    title={watching.participants?.[1]?.user?.username} />
                </div>
                <div className="flex justify-between text-xs mt-1 text-slate-500">
                  <span className="text-arena-cyan">58%</span>
                  <span className="text-arena-red">42%</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <Eye size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-400 font-semibold">Select a battle to spectate</p>
              <p className="text-sm text-slate-600 mt-1">You'll see live stats and predictions</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
