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
  const [countdownValue, setCountdownValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Load battle on mount ─────────────────────────────────────────────────
  useEffect(() => {
    battleApi
      .get(roomCode)
      .then(({ data }) => {
        setBattle(data.battle);
        // Sync ready state
        const me = data.battle?.participants?.find(
          (p) => p.user?._id === user?._id
        );
        if (me) setReady(me.ready);
      })
      .catch(() => setError("Could not load battle room."));
  }, [roomCode, user?._id]);

  // ── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    socket.emit("battle:join", { roomCode, user });

    const onUpdated = (updated) => {
      setBattle(updated);
      const me = updated?.participants?.find(
        (p) => p.user?._id === user?._id
      );
      if (me) setReady(me.ready);
    };

    const onCountdown = (value) => {
      setShowCountdown(true);
      setCountdownValue(value);
      // Navigate as soon as FIGHT is shown
      if (value === "FIGHT") {
        setTimeout(() => navigate(`/arena/${roomCode}`), 800);
      }
    };

    socket.on("battle:updated", onUpdated);
    socket.on("battle:countdown", onCountdown);
    socket.on("player:joined", onUpdated);

    return () => {
      socket.off("battle:updated", onUpdated);
      socket.off("battle:countdown", onCountdown);
      socket.off("player:joined", onUpdated);
    };
  }, [roomCode, socket, user, navigate]);

  // ── Actions ──────────────────────────────────────────────────────────────
  async function toggleReady() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await battleApi.ready(roomCode, !ready);
      setReady(!ready);
      setBattle(data.battle);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to update ready state.");
    } finally {
      setLoading(false);
    }
  }

  async function startBattle() {
    if (!allReady) return;
    socket.emit("battle:start", {
      roomCode,
      durationMinutes: battle?.durationMinutes ?? 30,
    });
    setShowCountdown(true);
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isHost =
    battle?.host?._id === user?._id || battle?.host === user?._id;
  const allReady =
    (battle?.participants?.every((p) => p.ready) ?? false) &&
    (battle?.participants?.length ?? 0) >= 2;
  const emptySlots = Math.max(
    0,
    (battle?.maxPlayers ?? 2) - (battle?.participants?.length ?? 0)
  );

  return (
    <section className="relative">
      {/* Countdown Overlay */}
      <AnimatePresence>
        {showCountdown && (
          <CountdownOverlay
            value={countdownValue}
            onComplete={() => navigate(`/arena/${roomCode}`)}
          />
        )}
      </AnimatePresence>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-arena-red/30 bg-arena-red/10 px-4 py-3 text-sm text-arena-red">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">
            Match Lobby
          </p>
          <h1 className="mt-1 font-display text-4xl font-black">
            {battle?.problem?.title ?? "Battle Lobby"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            {battle?.difficulty && (
              <span
                className={`font-semibold ${
                  battle.difficulty === "Easy"
                    ? "text-arena-green"
                    : battle.difficulty === "Hard" ||
                      battle.difficulty === "Expert"
                    ? "text-arena-red"
                    : "text-arena-gold"
                }`}
              >
                {battle.difficulty}
              </span>
            )}
            {battle?.battleType && <span>· {battle.battleType}</span>}
            {battle?.durationMinutes && (
              <span>· {battle.durationMinutes} min</span>
            )}
          </div>
        </div>

        {/* Room Code */}
        <div
          className="glass cursor-pointer rounded-xl px-5 py-3 text-center transition-all hover:border-arena-cyan/30"
          onClick={copyCode}
        >
          <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
            Room Code
          </p>
          <div className="flex items-center gap-2">
            <span className="mono text-2xl font-black text-arena-cyan">
              {roomCode}
            </span>
            <span className="text-arena-cyan opacity-60">
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            {copied ? "Copied!" : "Click to copy"}
          </p>
        </div>
      </div>

      {/* Player Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {battle?.participants?.map((p, i) => {
          const pUser = p?.user ?? null;
          const isYou = pUser?._id === user?._id;
          const isParticipantHost =
            pUser?._id === (battle?.host?._id ?? battle?.host);
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
            transition={{
              delay: (battle?.participants?.length ?? 0) * 0.1 + i * 0.1,
            }}
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
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
              <Shield size={15} className="text-arena-cyan" /> Problem Preview
            </h3>
            <p className="text-sm leading-6 text-slate-300 line-clamp-4">
              {battle.problem.description}
            </p>
            {battle.problem.examples?.[0] && (
              <pre className="mt-3 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-slate-400">
                Input: {battle.problem.examples[0].input}
                {"\n"}Output: {battle.problem.examples[0].output}
              </pre>
            )}
          </div>
        )}

        {/* Action Panel */}
        <div className="glass flex flex-col rounded-xl p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
            <Swords size={15} className="text-arena-red" /> Battle Controls
          </h3>

          {/* Participants status */}
          <div className="mb-5 flex-1 space-y-2">
            {battle?.participants?.map((p, i) => {
              const pUser = p?.user ?? null;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {pUser?.username ?? "Player"}
                    {pUser?._id === user?._id ? " (You)" : ""}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      p.ready ? "text-arena-green" : "text-slate-500"
                    }`}
                  >
                    {p.ready ? (
                      <>
                        <CheckCircle size={13} /> Ready
                      </>
                    ) : (
                      "Not Ready"
                    )}
                  </span>
                </div>
              );
            })}
            {(battle?.participants?.length ?? 0) < 2 && (
              <p className="text-xs text-slate-500">
                Waiting for opponent to join…
              </p>
            )}
          </div>

          <div className="space-y-3">
            {/* Ready Toggle */}
            <button
              id="ready-btn"
              onClick={toggleReady}
              disabled={loading}
              className={`btn w-full py-3 ${
                ready
                  ? "btn-ghost border-arena-green text-arena-green"
                  : "btn-success"
              }`}
            >
              {ready ? (
                <>
                  <CheckCircle size={16} /> Ready!
                </>
              ) : (
                <>
                  <Play size={16} /> Mark Ready
                </>
              )}
            </button>

            {/* Start Battle (host only) */}
            {isHost && (
              <button
                id="start-battle-btn"
                onClick={startBattle}
                disabled={!allReady}
                className="btn btn-danger w-full py-3 disabled:cursor-not-allowed disabled:opacity-40"
                title={!allReady ? "All players must be ready" : ""}
              >
                <Swords size={16} />
                {allReady
                  ? "Start Battle!"
                  : `Waiting (${
                      battle?.participants?.filter((p) => p.ready).length ?? 0
                    }/${battle?.participants?.length ?? 0} ready)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
