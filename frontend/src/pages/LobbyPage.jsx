import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Copy, Play, Shield, Swords } from "lucide-react";
import { battleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocket } from "../services/socket.js";
import PlayerCard from "../components/PlayerCard.jsx";
import CountdownOverlay from "../components/CountdownOverlay.jsx";

export default function LobbyPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useMemo(() => getSocket(), []);

  const [battle, setBattle] = useState(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    battleApi.get(roomCode)
      .then(({ data }) => setBattle(data.battle))
      .catch(() => {});

    socket.emit("battle:join", { roomCode });

    socket.on("battle:updated", (updated) => setBattle(updated));
    socket.on("battle:countdown", () => setShowCountdown(true));

    return () => {
      socket.off("battle:updated");
      socket.off("battle:countdown");
    };
  }, [roomCode, socket]);

  async function toggleReady() {
    setLoading(true);
    try {
      const { data } = await battleApi.ready(roomCode, !ready);
      setReady(!ready);
      setBattle(data.battle);
    } finally {
      setLoading(false);
    }
  }

  async function startBattle() {
    socket.emit("battle:start", { roomCode, durationMinutes: battle?.durationMinutes ?? 30 });
    setShowCountdown(true);
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isHost = battle?.host?._id === user?._id || battle?.host === user?._id;
  const allReady = battle?.participants?.every((p) => p.ready) && (battle?.participants?.length ?? 0) >= 2;

  const getParticipantUser = (p) => p?.user ?? null;
  const emptySlots = Math.max(0, (battle?.maxPlayers ?? 2) - (battle?.participants?.length ?? 0));

  return (
    <section className="relative">
      {showCountdown && (
        <CountdownOverlay onComplete={() => navigate(`/arena/${roomCode}`)} />
      )}

      {/* Header */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Match Lobby</p>
          <h1 className="mt-1 font-display text-4xl font-black">
            {battle?.problem?.title ?? "Battle Lobby"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            {battle?.difficulty && (
              <span className={`font-semibold ${battle.difficulty === "Easy" ? "text-arena-green" : battle.difficulty === "Hard" ? "text-arena-red" : "text-arena-gold"}`}>
                {battle.difficulty}
              </span>
            )}
            {battle?.battleType && <span>· {battle.battleType}</span>}
            {battle?.durationMinutes && <span>· {battle.durationMinutes} min</span>}
          </div>
        </div>

        {/* Room Code */}
        <div
          className="glass rounded-xl px-5 py-3 text-center cursor-pointer hover:border-arena-cyan/30 transition-all"
          onClick={copyCode}
        >
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Room Code</p>
          <div className="flex items-center gap-2">
            <span className="mono text-2xl font-black text-arena-cyan">{roomCode}</span>
            <span className="text-arena-cyan opacity-60">
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">{copied ? "Copied!" : "Click to copy"}</p>
        </div>
      </div>

      {/* Player Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {battle?.participants?.map((p, i) => {
          const pUser = getParticipantUser(p);
          const isYou = pUser?._id === user?._id;
          const isParticipantHost = pUser?._id === (battle?.host?._id ?? battle?.host);
          return (
            <motion.div
              key={pUser?._id ?? i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <PlayerCard
                user={pUser}
                isReady={p.ready}
                isHost={isParticipantHost}
                isYou={isYou}
              />
            </motion.div>
          );
        })}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (battle?.participants?.length ?? 0) * 0.1 + i * 0.1 }}
          >
            <PlayerCard user={null} />
          </motion.div>
        ))}
      </div>

      {/* Battle Info + Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Problem Preview */}
        {battle?.problem && (
          <div className="glass rounded-xl p-5">
            <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
              <Shield size={15} className="text-arena-cyan" /> Problem Preview
            </h3>
            <p className="text-sm text-slate-300 leading-6">{battle.problem.description}</p>
            {battle.problem.examples?.[0] && (
              <pre className="mt-3 rounded-lg bg-black/40 p-3 text-xs text-slate-400 overflow-auto">
                Input: {battle.problem.examples[0].input}{"\n"}Output: {battle.problem.examples[0].output}
              </pre>
            )}
          </div>
        )}

        {/* Action Panel */}
        <div className="glass rounded-xl p-5 flex flex-col">
          <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
            <Swords size={15} className="text-arena-red" /> Battle Controls
          </h3>

          {/* Participants status */}
          <div className="space-y-2 mb-5 flex-1">
            {battle?.participants?.map((p, i) => {
              const pUser = getParticipantUser(p);
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{pUser?.username ?? "Player"}</span>
                  <span className={`font-semibold flex items-center gap-1 ${p.ready ? "text-arena-green" : "text-slate-500"}`}>
                    {p.ready ? <><CheckCircle size={13} /> Ready</> : "Not Ready"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {/* Ready Toggle */}
            <button
              id="ready-btn"
              onClick={toggleReady}
              disabled={loading}
              className={`btn w-full py-3 ${ready ? "btn-ghost border-arena-green text-arena-green" : "btn-success"}`}
            >
              {ready ? <><CheckCircle size={16} /> Ready!</> : <><Play size={16} /> Mark Ready</>}
            </button>

            {/* Start Battle (host only) */}
            {isHost && (
              <button
                id="start-battle-btn"
                onClick={startBattle}
                disabled={!allReady}
                className="btn btn-danger w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Swords size={16} />
                {allReady ? "Start Battle!" : `Waiting (${battle?.participants?.filter((p) => p.ready).length}/${battle?.participants?.length} ready)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
