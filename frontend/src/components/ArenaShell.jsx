import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Building2, Code2, LogOut, Menu, Swords,
  Trophy, Tv, User, X, Zap, ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import RankBadge from "./RankBadge.jsx";

const nav = [
  { label: "Dashboard",    path: "/",             Icon: Activity,   accent: "cyan" },
  { label: "Battle Arena", path: "/battles",      Icon: Swords,     accent: "red" },
  { label: "Live Demo",    path: "/arena/demo",   Icon: Code2,      accent: "green" },
  { label: "Leaderboard",  path: "/leaderboard",  Icon: Trophy,     accent: "gold" },
  { label: "Tournaments",  path: "/tournaments",  Icon: Zap,        accent: "purple" },
  { label: "Hiring",       path: "/hiring",       Icon: Building2,  accent: "cyan" },
  { label: "Spectate",     path: "/spectate",     Icon: Tv,         accent: "cyan" },
  { label: "Profile",      path: "/profile",      Icon: User,       accent: "cyan" },
];

const ACCENT_COLORS = {
  cyan:   { active: "text-arena-cyan bg-arena-cyan/10 border-arena-cyan/30",   icon: "text-arena-cyan" },
  red:    { active: "text-arena-red bg-arena-red/10 border-arena-red/30",      icon: "text-arena-red" },
  green:  { active: "text-arena-green bg-arena-green/10 border-arena-green/30",icon: "text-arena-green" },
  gold:   { active: "text-arena-gold bg-arena-gold/10 border-arena-gold/30",   icon: "text-arena-gold" },
  purple: { active: "text-arena-purple bg-arena-purple/10 border-arena-purple/30", icon: "text-arena-purple" },
};

export default function ArenaShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <button
        onClick={() => { navigate("/"); setMobileOpen(false); }}
        className="flex items-center gap-3 mb-8 group"
      >
        <div
          className="grid h-10 w-10 place-items-center rounded-lg font-display text-xl font-black text-arena-bg transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #00E5FF, #9D4EDD)",
            boxShadow: "0 0 16px rgba(0,229,255,0.4)",
          }}
        >
          CA
        </div>
        <span>
          <span className="block font-display text-xl font-black group-hover:text-arena-cyan transition-colors">CodeArena</span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-arena-red font-semibold">Competitive Arena</span>
        </span>
      </button>

      {/* Nav Items */}
      <nav className="space-y-0.5 flex-1">
        {nav.map(({ label, path, Icon, accent }) => {
          const colors = ACCENT_COLORS[accent];
          return (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold border transition-all duration-200 group ${
                  isActive
                    ? `${colors.active} border shadow-sm`
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? colors.icon : "text-slate-500 group-hover:text-slate-300"} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={13} className={colors.icon} />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(157,78,221,0.2))",
                border: "1.5px solid rgba(0,229,255,0.3)",
              }}
            >
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.username ?? "Guest"}</p>
              <RankBadge rank={user?.rank ?? "Bronze"} size="xs" showIcon={false} />
            </div>
          </div>

          <div className="mt-3 flex gap-2 text-xs text-slate-500">
            <span className="flex-1 text-center">
              <span className="text-arena-cyan font-bold">{user?.elo ?? 1000}</span> ELO
            </span>
            <span className="flex-1 text-center">
              <span className="text-arena-green font-bold">{user?.wins ?? 0}</span>W
            </span>
            <span className="flex-1 text-center">
              <span className="text-arena-red font-bold">{user?.losses ?? 0}</span>L
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/8 py-2 text-xs text-slate-400 hover:border-arena-red/50 hover:text-arena-red transition-all duration-200"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen battle-grid">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/6 bg-arena-bg/92 px-4 py-5 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/6 bg-arena-bg/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded font-display text-sm font-black text-arena-bg"
            style={{ background: "linear-gradient(135deg, #00E5FF, #9D4EDD)" }}
          >
            CA
          </div>
          <span className="font-display font-black text-lg">CodeArena</span>
        </button>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/8 bg-arena-bg px-4 py-5 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-5 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
