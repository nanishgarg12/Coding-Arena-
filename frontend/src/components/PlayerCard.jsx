import RankBadge from "./RankBadge.jsx";
import { winRate } from "../utils/ranks.js";

export default function PlayerCard({ user, isReady = false, isHost = false, isYou = false }) {
  if (!user) {
    return (
      <div className="glass rounded-xl p-5 flex flex-col items-center justify-center min-h-[180px] border-dashed">
        <div className="text-4xl opacity-20">?</div>
        <p className="mt-2 text-sm text-slate-500">Waiting for player...</p>
      </div>
    );
  }

  const wRate = winRate(user);
  const initials = user.username?.[0]?.toUpperCase() ?? "?";
  const totalGames = (user.wins ?? 0) + (user.losses ?? 0);

  return (
    <div
      className={`glass rounded-xl p-5 relative overflow-hidden transition-all duration-300 ${
        isYou ? "neon-border-cyan" : "hover:border-white/20"
      }`}
    >
      {/* Ready indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {isHost && (
          <span className="text-xs font-semibold text-arena-gold bg-arena-gold/10 border border-arena-gold/30 px-2 py-0.5 rounded">
            HOST
          </span>
        )}
        {isYou && (
          <span className="text-xs font-semibold text-arena-cyan bg-arena-cyan/10 border border-arena-cyan/30 px-2 py-0.5 rounded">
            YOU
          </span>
        )}
        <div
          className={`h-2.5 w-2.5 rounded-full ${isReady ? "bg-arena-green shadow-[0_0_6px_rgba(0,255,136,0.8)]" : "bg-slate-600"}`}
          title={isReady ? "Ready" : "Not Ready"}
        />
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center font-display text-2xl font-black"
          style={{
            background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(157,78,221,0.2))",
            border: "2px solid rgba(0,229,255,0.3)",
            boxShadow: "0 0 16px rgba(0,229,255,0.15)",
          }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-arena-cyan">{initials}</span>
          )}
        </div>

        <p className="mt-3 font-display text-lg font-bold truncate max-w-full">{user.username}</p>
        <div className="mt-1.5">
          <RankBadge rank={user.rank ?? "Bronze"} size="sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">ELO</p>
          <p className="font-display font-bold text-arena-cyan">{user.elo ?? 1000}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Win%</p>
          <p className="font-display font-bold text-arena-green">{wRate}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Games</p>
          <p className="font-display font-bold text-slate-300">{totalGames}</p>
        </div>
      </div>

      {/* Ready status bar */}
      <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isReady ? "bg-arena-green w-full shadow-[0_0_8px_rgba(0,255,136,0.6)]" : "w-0"
          }`}
        />
      </div>
      <p className={`mt-1.5 text-center text-xs font-semibold ${isReady ? "text-arena-green" : "text-slate-500"}`}>
        {isReady ? "✓ Ready" : "Not Ready"}
      </p>
    </div>
  );
}
