import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Building2, CheckCircle, Clock, Eye, Plus, Shield, User, X } from "lucide-react";
import { assessmentApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const MOCK_CANDIDATES = [
  { id: "1", name: "Rahul Sharma",   score: 94, time: "18:42", integrity: 98, solved: 3, status: "hired",    strengths: ["Arrays", "DP"], weaknesses: ["Graphs"] },
  { id: "2", name: "Priya Mehta",    score: 87, time: "24:11", integrity: 100,solved: 2, status: "review",   strengths: ["Strings", "Trees"], weaknesses: ["Backtracking"] },
  { id: "3", name: "Amir Khan",      score: 71, time: "28:55", integrity: 85, solved: 2, status: "review",   strengths: ["SQL", "Debugging"], weaknesses: ["DP", "Graphs"] },
  { id: "4", name: "Sara Johnson",   score: 98, time: "12:03", integrity: 100,solved: 3, status: "hired",    strengths: ["DP", "Graphs"], weaknesses: [] },
  { id: "5", name: "Wei Zhang",      score: 45, time: "45:00", integrity: 60, solved: 1, status: "rejected", strengths: ["Arrays"], weaknesses: ["All advanced"] },
];

const STATUS_STYLES = {
  hired:    { cls: "text-arena-green bg-arena-green/10 border-arena-green/30", label: "Hired" },
  review:   { cls: "text-arena-gold bg-arena-gold/10 border-arena-gold/30",   label: "In Review" },
  rejected: { cls: "text-arena-red bg-arena-red/10 border-arena-red/30",      label: "Rejected" },
};

export default function HiringPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [candidates] = useState(MOCK_CANDIDATES);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", difficulty: "Medium", durationMinutes: 60 });

  useEffect(() => {
    assessmentApi.list().then(({ data }) => setAssessments(data.assessments ?? [])).catch(() => {});
  }, []);

  async function createAssessment(e) {
    e.preventDefault();
    try {
      const { data } = await assessmentApi.create(form);
      setAssessments((a) => [data.assessment, ...a]);
    } catch {}
    setShowCreate(false);
  }

  const avgScore = Math.round(candidates.reduce((s, c) => s + c.score, 0) / candidates.length);
  const hiredCount = candidates.filter((c) => c.status === "hired").length;

  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-arena-red">Recruiter Console</p>
        <h1 className="mt-1 font-display text-4xl font-black">Hiring Dashboard</h1>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Avg Score",    value: `${avgScore}%`,           accent: "cyan" },
          { label: "Hired",        value: hiredCount,                accent: "green" },
          { label: "Integrity Avg",value: "89%",                    accent: "gold" },
          { label: "Assessments",  value: candidates.length,         accent: "purple" },
        ].map(({ label, value, accent }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-xl p-4 stat-${accent}`}>
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className={`mt-1.5 font-display text-3xl font-black text-arena-${accent}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Candidate Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="font-display text-lg font-black flex items-center gap-2">
              <User size={16} className="text-arena-cyan" /> Candidates
            </h2>
            <button onClick={() => setShowCreate(true)} className="btn btn-danger gap-2 text-xs py-2">
              <Plus size={13} /> New Assessment
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {candidates.map((c, i) => {
              const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.review;
              const integrityColor = c.integrity >= 90 ? "text-arena-green" : c.integrity >= 70 ? "text-arena-gold" : "text-arena-red";
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="arena-row px-5 py-4 grid grid-cols-[1fr_80px_80px_80px_60px_80px] gap-3 items-center cursor-pointer transition-colors"
                  onClick={() => setSelected(c)}
                >
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.solved}/3 solved</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-arena-cyan">{c.score}%</p>
                    <p className="text-[10px] text-slate-500">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-sm text-slate-300">{c.time}</p>
                    <p className="text-[10px] text-slate-500">Time</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold text-sm ${integrityColor}`}>{c.integrity}%</p>
                    <p className="text-[10px] text-slate-500">Integrity</p>
                  </div>
                  <div className="text-center">
                    <Eye size={14} className="mx-auto text-slate-600 hover:text-arena-cyan transition-colors" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold border rounded px-2 py-0.5 ${st.cls}`}>{st.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Candidate Report */}
        <div>
          {selected ? (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-xl p-5 sticky top-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Candidate Report</p>
                  <h3 className="font-display text-xl font-black mt-1">{selected.name}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Score Ring */}
              <div className="flex items-center justify-center my-4">
                <div
                  className="h-24 w-24 rounded-full flex flex-col items-center justify-center"
                  style={{
                    background: `conic-gradient(#00E5FF ${selected.score * 3.6}deg, rgba(255,255,255,0.05) 0)`,
                    boxShadow: "0 0 20px rgba(0,229,255,0.3)"
                  }}
                >
                  <div className="h-16 w-16 rounded-full bg-arena-bg flex flex-col items-center justify-center">
                    <p className="font-display text-xl font-black text-arena-cyan">{selected.score}%</p>
                    <p className="text-[9px] text-slate-500">Score</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><Clock size={12} /> Time Taken</span>
                  <span className="font-mono font-semibold">{selected.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><Shield size={12} /> Integrity</span>
                  <span className={`font-semibold ${selected.integrity >= 90 ? "text-arena-green" : selected.integrity >= 70 ? "text-arena-gold" : "text-arena-red"}`}>
                    {selected.integrity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Problems Solved</span>
                  <span className="font-semibold">{selected.solved}/3</span>
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-arena-green mb-2">✓ Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.strengths.map((s) => (
                      <span key={s} className="text-xs bg-arena-green/10 border border-arena-green/25 text-arena-green px-2 py-0.5 rounded">{s}</span>
                    ))}
                    {!selected.strengths.length && <span className="text-xs text-slate-500">None noted</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-arena-red mb-2">✗ Weaknesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.weaknesses.map((w) => (
                      <span key={w} className="text-xs bg-arena-red/10 border border-arena-red/25 text-arena-red px-2 py-0.5 rounded">{w}</span>
                    ))}
                    {!selected.weaknesses.length && <span className="text-xs text-arena-green">None noted 🎉</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="btn btn-success flex-1 py-2 text-xs">Accept</button>
                <button className="btn btn-ghost flex-1 py-2 text-xs text-arena-red border-arena-red/30 hover:bg-arena-red/10">Reject</button>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <BarChart3 size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-400 font-semibold">Click a candidate</p>
              <p className="text-sm text-slate-600 mt-1">to view their full report</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
