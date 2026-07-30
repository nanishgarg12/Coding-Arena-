import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { difficultyStyle } from "../utils/ranks.js";

const CATEGORY_COLORS = {
  ARRAY:         "#00E5FF",
  STRING:        "#9D4EDD",
  "LINKED LIST": "#FFD700",
  STACK:         "#FF0055",
  TREE:          "#00FF88",
  GRAPH:         "#FF6B00",
  SEARCH:        "#00BFFF",
  DP:            "#FF0055",
  BACKTRACKING:  "#9D4EDD",
  SQL:           "#4DB8FF",
  Debugging:     "#FFD700",
  Frontend:      "#00FF88",
  "System Design":"#FF6B00",
};

export default function ProblemTable({ problems = [] }) {
  const [sortKey, setSortKey] = useState("acceptanceRate");
  const [sortDir, setSortDir] = useState("desc");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const navigate = useNavigate();

  const categories = ["All", ...new Set(problems.map((p) => p.category))];
  const difficulties = ["All", "Beginner", "Easy", "Medium", "Hard", "Expert"];

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...problems]
    .filter((p) => filterDiff === "All" || p.difficulty === filterDiff)
    .filter((p) => filterCat === "All" || p.category === filterCat)
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === "asc"
        ? typeof av === "string" ? av.localeCompare(bv) : av - bv
        : typeof bv === "string" ? bv.localeCompare(av) : bv - av;
    });

  function SortIcon({ k }) {
    if (sortKey !== k) return null;
    return sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-white/5 flex flex-wrap gap-3 items-center justify-between">
        <h3 className="font-display text-lg font-bold">Problem Set</h3>
        <div className="flex gap-2 flex-wrap">
          <select
            className="rounded-md border border-white/10 bg-arena-bg px-2 py-1.5 text-sm text-white"
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
          >
            {difficulties.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            className="rounded-md border border-white/10 bg-arena-bg px-2 py-1.5 text-sm text-white"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              {[["#", null], ["Title", "title"], ["Category", "category"], ["Difficulty", "difficulty"], ["Acceptance", "acceptanceRate"]].map(
                ([label, key]) => (
                  <th
                    key={label}
                    className={`px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider ${key ? "cursor-pointer hover:text-arena-cyan" : ""}`}
                    onClick={() => key && toggleSort(key)}
                  >
                    <span className="flex items-center gap-1">
                      {label} {key && <SortIcon k={key} />}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 20).map((p, i) => {
              const dStyle = difficultyStyle(p.difficulty);
              const catColor = CATEGORY_COLORS[p.category] ?? "#94a3b8";
              return (
                <tr
                  key={p._id ?? p.slug ?? i}
                  className="arena-row border-b border-white/5 cursor-pointer transition-colors"
                  onClick={() => navigate(`/problems/${p.slug ?? p._id}`)}
                >
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium hover:text-arena-cyan transition-colors">{p.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                      style={{ color: catColor, background: catColor + "18" }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${dStyle.className}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-arena-cyan"
                          style={{ width: `${p.acceptanceRate ?? 50}%`, opacity: 0.7 }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{p.acceptanceRate ?? 50}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No problems match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > 20 && (
        <div className="p-3 text-center text-xs text-slate-500 border-t border-white/5">
          Showing 20 of {sorted.length} problems
        </div>
      )}
    </div>
  );
}
