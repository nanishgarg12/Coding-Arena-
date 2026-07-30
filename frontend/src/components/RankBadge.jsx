import { rankInfo, rankClass } from "../utils/ranks.js";

const RANK_ICONS = {
  Bronze:      "🥉",
  Silver:      "🥈",
  Gold:        "🥇",
  Platinum:    "💎",
  Diamond:     "💠",
  Master:      "🔮",
  Grandmaster: "⚔️",
};

export default function RankBadge({ rank = "Bronze", size = "md", showIcon = true }) {
  const cls = rankClass(rank);
  const info = rankInfo(rank);
  const icon = RANK_ICONS[rank] ?? "🏅";

  const sizeClasses = {
    xs:  "text-xs px-1.5 py-0.5 text-[10px]",
    sm:  "text-xs px-2 py-0.5",
    md:  "text-sm px-2.5 py-1",
    lg:  "text-base px-3 py-1.5 font-bold",
    xl:  "text-lg px-4 py-2 font-black",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-semibold font-display uppercase tracking-wider ${cls} ${sizeClasses[size] ?? sizeClasses.md}`}
      style={{ borderColor: info.color + "66", background: info.color + "11" }}
      title={rank}
    >
      {showIcon && <span>{icon}</span>}
      {rank}
    </span>
  );
}
