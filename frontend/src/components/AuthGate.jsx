import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen battle-grid flex items-center justify-center" style={{ background: "#050816" }}>
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div
            className="grid h-16 w-16 place-items-center rounded-xl font-display text-2xl font-black text-arena-bg"
            style={{ background: "linear-gradient(135deg, #00E5FF, #9D4EDD)", boxShadow: "0 0 30px rgba(0,229,255,0.4)" }}
          >
            CA
          </div>
          {/* Spinner */}
          <div className="h-6 w-6 rounded-full border-2 border-arena-cyan/30 border-t-arena-cyan animate-spin" />
          <p className="text-sm text-slate-400 tracking-widest uppercase">Entering Arena…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
