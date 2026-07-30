import { Navigate, Route, Routes } from "react-router-dom";
import ArenaShell from "./components/ArenaShell.jsx";
import AuthGate from "./components/AuthGate.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import BattlesPage from "./pages/BattlesPage.jsx";
import LobbyPage from "./pages/LobbyPage.jsx";
import LiveArenaPage from "./pages/LiveArenaPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import TournamentsPage from "./pages/TournamentsPage.jsx";
import HiringPage from "./pages/HiringPage.jsx";
import SpectatorPage from "./pages/SpectatorPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGate><ArenaShell /></AuthGate>}>
        <Route index element={<DashboardPage />} />
        <Route path="/battles" element={<BattlesPage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/arena/:roomCode" element={<LiveArenaPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/hiring" element={<HiringPage />} />
        <Route path="/spectate" element={<SpectatorPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
