// ===== Rank System =====
const RANKS = [
  { name: "Bronze",      minElo: 0,    color: "#cd7f32", className: "rank-bronze" },
  { name: "Silver",      minElo: 1100, color: "#c0c0c0", className: "rank-silver" },
  { name: "Gold",        minElo: 1300, color: "#FFD700", className: "rank-gold" },
  { name: "Platinum",    minElo: 1500, color: "#00E5FF", className: "rank-platinum" },
  { name: "Diamond",     minElo: 1700, color: "#b9f2ff", className: "rank-diamond" },
  { name: "Master",      minElo: 1900, color: "#9D4EDD", className: "rank-master" },
  { name: "Grandmaster", minElo: 2100, color: "#FF0055", className: "rank-grandmaster" },
];

export function rankFromElo(elo) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) return RANKS[i].name;
  }
  return "Bronze";
}

export function rankInfo(rankName) {
  return RANKS.find((r) => r.name === rankName) || RANKS[0];
}

export function rankColor(rankName) {
  return rankInfo(rankName).color;
}

export function rankClass(rankName) {
  return rankInfo(rankName).className;
}

export function nextRankElo(elo) {
  for (const rank of RANKS) {
    if (elo < rank.minElo) return rank.minElo;
  }
  return null; // Grandmaster – max rank
}

export function rankProgress(elo) {
  let prevMin = 0;
  let nextMin = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (elo < RANKS[i].minElo) {
      prevMin = RANKS[i - 1]?.minElo ?? 0;
      nextMin = RANKS[i].minElo;
      break;
    }
  }
  if (nextMin === null) return 100; // Grandmaster
  return Math.round(((elo - prevMin) / (nextMin - prevMin)) * 100);
}

// ===== Win Rate =====
export function winRate(user) {
  const total = (user?.wins ?? 0) + (user?.losses ?? 0);
  if (total === 0) return 0;
  return Math.round(((user?.wins ?? 0) / total) * 100);
}

// ===== Timer Formatting =====
export function formatTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function timerPhase(seconds) {
  if (seconds <= 30) return "critical";
  if (seconds <= 300) return "warning";
  return "normal";
}

// ===== XP / Level =====
export function xpForLevel(level) {
  return level * 500;
}

export function levelProgress(xp) {
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const base = (level - 1) * 500;
  return {
    level,
    progress: xp - base,
    required: 500,
    percent: Math.min(100, Math.round(((xp - base) / 500) * 100)),
  };
}

// ===== Difficulty Colors =====
const DIFF_STYLES = {
  Beginner: { label: "Beginner", className: "diff-beginner", color: "#94a3b8" },
  Easy:     { label: "Easy",     className: "diff-easy",     color: "#00FF88" },
  Medium:   { label: "Medium",   className: "diff-medium",   color: "#FFD700" },
  Hard:     { label: "Hard",     className: "diff-hard",     color: "#FF0055" },
  Expert:   { label: "Expert",   className: "diff-expert",   color: "#9D4EDD" },
};

export function difficultyStyle(difficulty) {
  return DIFF_STYLES[difficulty] || DIFF_STYLES.Easy;
}

// ===== Room Code Generator (client-side display) =====
export function formatRoomCode(code) {
  return code?.toUpperCase() ?? "";
}

// ===== Achievement Metadata =====
export const ACHIEVEMENTS = {
  FIRST_BLOOD:  { label: "First Blood",  icon: "🩸", desc: "Win your first battle" },
  SPEED_DEMON:  { label: "Speed Demon",  icon: "⚡", desc: "Win in under 5 minutes" },
  BUG_HUNTER:   { label: "Bug Hunter",   icon: "🐛", desc: "Find a subtle bug in debugging mode" },
  JAVA_MASTER:  { label: "Java Master",  icon: "☕", desc: "Win 10 battles with Java" },
  CENTURION:    { label: "100 Battles",  icon: "💯", desc: "Participate in 100 battles" },
  UNDEFEATED:   { label: "Undefeated",   icon: "🛡️", desc: "Win 5 battles in a row" },
  ROOKIE:       { label: "Rookie",       icon: "🌟", desc: "Welcome to the Arena" },
};
