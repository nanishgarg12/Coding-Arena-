import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Plus, Trophy, Users, X, Zap } from "lucide-react";
import { tournamentApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const DIFF_COLORS = { Easy: "text-arena-green", Medium: "text-arena-gold", Hard: "text-arena-red", Expert: "text-arena-purple" };
const STATUS_STYLES = {
  registration: "bg-arena-cyan/15 text-arena-cyan border-arena-cyan/30",
  live:         "bg-arena-red/15  text-arena-red  border-arena-red/30",
  completed:    "bg-white/5       text-slate-400  border-white/10",
};

const MOCK = [
  { _id: "1", name: "Weekly Sprint",      difficulty: "Easy",   status: "registration", maxParticipants: 64,  registeredCount: 28, prize: "500 XP",  startDate: "2026-08-02" },
  { _id: "2", name: "DSA Championship",   difficulty: "Hard",   status: "live",         maxParticipants: 128, registeredCount: 128,prize: "2000 XP", startDate: "2026-08-09" },
  { _id: "3", name: "Placement Prep Cup", difficulty: "Medium", status: "registration", maxParticipants: 32,  registeredCount: 11, prize: "1000 XP", startDate: "2026-08-15" },
  { _id: "4", name: "Debugging Masters",  difficulty: "Expert", status: "completed",    maxParticipants: 16,  registeredCount: 16, prize: "Completed",startDate: "2026-07-20" },
];

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", difficulty: "Medium", maxParticipants: 16 });
  const [registered, setRegistered] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tournamentApi.list()
      .then(({ data }) => setTournaments(data.tournaments?.length ? data.tournaments : MOCK))
      .catch(() => setTournaments(MOCK));
  }, []);

  async function createTournament(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await tournamentApi.create(form);
      setTournaments((t) => [data.tournament, ...t]);
      setShowCreate(false);
    } catch {
      // fallback: add mock
      setTournaments((t) => [{
        _id: Date.now().toString(), ...form, status: "registration",
        registeredCount: 0, prize: "500 XP", startDate: new Date().toISOString().split("T")[0]
      }, ...t]);
      setShowCreate(false);
    } finally {
      setLoading(false);
    }
  }

  async function register(id) {
    try {
      await tournamentApi.register(id);
      setRegistered((s) => new Set([...s, id]));
    } catch {
      setRegistered((s) => new Set([...s, id]));
    }
  }

  return (
    <section>
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Competitive Events</p>
          <h1 className="mt-1 font-display text-4xl font-black">Tournaments</h1>
        </div>
        <button id="create-tournament-btn" onClick={() => setShowCreate(true)} className="btn btn-danger gap-2">
          <Plus size={16} /> Create Tournament
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass w-full max-w-md rounded-2xl p-6" style={{ border: "1px solid rgba(255,0,85,0.2)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-black">Create Tournament</h2>
                  <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={createTournament} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Tournament Name</label>
                    <input
                      required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-arena-cyan"
                      placeholder="e.g. Spring Championship" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Difficulty</label>
                      <select className="w-full rounded-xl border border-white/10 bg-arena-bg px-3 py-3 text-sm"
                        value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                        {["Easy", "Medium", "Hard", "Expert"].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Max Players</label>
                      <select className="w-full rounded-xl border border-white/10 bg-arena-bg px-3 py-3 text-sm"
                        value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}>
                        {[8, 16, 32, 64, 128].map((n) => <option key={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-danger w-full py-3">
                    {loading ? "Creating…" : "Create Tournament"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tournament Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.map((t, i) => {
          const isReg = registered.has(t._id);
          const statusClass = STATUS_STYLES[t.status] ?? STATUS_STYLES.registration;
          const fillPct = Math.round(((t.registeredCount ?? 0) / (t.maxParticipants ?? 1)) * 100);

          return (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-5 hover:border-arena-cyan/15 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold border rounded px-2 py-0.5 ${statusClass}`}>
                      {t.status === "live" ? "● LIVE" : t.status === "registration" ? "OPEN" : "ENDED"}
                    </span>
                    {t.difficulty && (
                      <span className={`text-xs font-semibold ${DIFF_COLORS[t.difficulty] ?? "text-slate-400"}`}>
                        {t.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-black">{t.name}</h3>
                </div>
                <div className="text-right">
                  <Trophy size={20} className="text-arena-gold ml-auto mb-1" />
                  <p className="text-xs text-arena-gold font-semibold">{t.prize}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users size={13} /> {t.registeredCount}/{t.maxParticipants} players
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar size={13} /> {t.startDate}
                </div>
              </div>

              {/* Fill bar */}
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${fillPct}%`,
                    background: fillPct >= 100 ? "#FF0055" : "linear-gradient(90deg, #00E5FF, #9D4EDD)"
                  }}
                />
              </div>

              <button
                onClick={() => register(t._id)}
                disabled={t.status === "completed" || isReg || fillPct >= 100}
                className={`btn w-full py-2.5 text-sm ${
                  isReg ? "btn-ghost text-arena-green border-arena-green/40" :
                  t.status === "completed" ? "btn-ghost opacity-40 cursor-not-allowed" :
                  fillPct >= 100 ? "btn-ghost opacity-40 cursor-not-allowed" : "btn-primary"
                }`}
              >
                {isReg ? "✓ Registered" : t.status === "completed" ? "Tournament Ended" : fillPct >= 100 ? "Full" : "Register Now"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
