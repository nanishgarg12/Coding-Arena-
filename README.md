# CodeArena ⚔️
## AI-Powered Real-Time Competitive Coding Battle Platform

> *"The Valorant of Competitive Programming"*

---

## 🎮 Platform Features

| Feature | Status |
|---|---|
| JWT Authentication (Register/Login/Profile) | ✅ |
| Real-Time Battle Rooms (Socket.io) | ✅ |
| Monaco Code Editor (Java, C++) | ✅ |
| Judge0 Code Execution (+ Mock fallback) | ✅ |
| AI Coach (feedback + complexity analysis) | ✅ |
| Anti-Cheat System (tab switch, copy/paste, fullscreen) | ✅ |
| ELO Ranking System (Bronze → Grandmaster) | ✅ |
| Achievement System | ✅ |
| 51 Problem Database | ✅ |
| Tournament System | ✅ |
| Company Hiring Dashboard | ✅ |
| Spectator Mode | ✅ |
| Winner Calculation (3-priority logic) | ✅ |
| Cyberpunk Esports UI | ✅ |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and Install

```bash
# Install root deps
npm install

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env
```

**Backend `.env`:**
```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/codearena
JWT_SECRET=your-super-secret-jwt-key-here
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_KEY=          # Optional - leave blank for mock execution
AI_PROVIDER_URL=     # Optional - leave blank for built-in coach
AI_PROVIDER_KEY=     # Optional
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed the Problem Database

```bash
cd backend && npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit: **http://localhost:5173**

---

## 🏗️ Project Structure

```
CodeArena/
├── frontend/                    # React + Vite + Tailwind
│   └── src/
│       ├── pages/               # All 10 pages
│       │   ├── LoginPage.jsx    # Auth with rank showcase
│       │   ├── DashboardPage.jsx# Command center
│       │   ├── BattlesPage.jsx  # Live battle arena
│       │   ├── LobbyPage.jsx    # Pre-match lobby
│       │   ├── LiveArenaPage.jsx# Main competition screen
│       │   ├── LeaderboardPage.jsx
│       │   ├── TournamentsPage.jsx
│       │   ├── HiringPage.jsx
│       │   ├── SpectatorPage.jsx
│       │   └── ProfilePage.jsx
│       ├── components/          # Reusable UI
│       │   ├── ArenaShell.jsx   # Main layout + nav
│       │   ├── RankBadge.jsx    # Tier badges
│       │   ├── PlayerCard.jsx   # Player display
│       │   ├── StatCard.jsx     # Metric cards
│       │   ├── ProblemTable.jsx # Problem list
│       │   ├── Heatmap.jsx      # Activity calendar
│       │   ├── CountdownOverlay.jsx
│       │   ├── WinnerModal.jsx  # Victory/defeat overlay
│       │   └── AuthGate.jsx     # Protected routes
│       ├── context/
│       │   └── AuthContext.jsx  # JWT auth state
│       ├── hooks/
│       │   └── useAntiCheat.js  # Anti-cheat system
│       ├── services/
│       │   ├── api.js           # Axios instance + endpoints
│       │   └── socket.js        # Socket.io client
│       └── utils/
│           └── ranks.js         # ELO, rank, XP utilities
│
└── backend/                     # Node.js + Express + Socket.io
    ├── controllers/             # Route handlers
    ├── models/                  # Mongoose schemas
    │   ├── User.js              # Player with ELO/rank/achievements
    │   ├── Battle.js            # Room + participants
    │   ├── Problem.js           # Coding problems
    │   ├── Tournament.js
    │   ├── Assessment.js
    │   └── CheatingLog.js
    ├── routes/                  # Express routers
    ├── middleware/
    │   ├── authMiddleware.js    # JWT verification
    │   └── errorMiddleware.js
    ├── socket/
    │   └── battleSocket.js      # Real-time events
    ├── services/
    │   ├── judgeService.js      # Judge0 integration
    │   ├── aiCoachService.js    # AI coaching
    │   ├── winnerService.js     # Winner calculation
    │   └── tokenService.js      # JWT signing
    └── data/
        ├── problemBank.js       # 51 problems dataset
        └── seedProblems.js      # DB seeder
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#050816` |
| Card | `#101827` |
| Cyber Cyan | `#00E5FF` |
| Battle Red | `#FF0055` |
| Victory Green | `#00FF88` |
| Gold | `#FFD700` |
| Purple | `#9D4EDD` |

**Fonts:** Plus Jakarta Sans (UI), JetBrains Mono (code)

---

## 🏆 Rank System

| Rank | ELO |
|---|---|
| 🥉 Bronze | 0–1099 |
| 🥈 Silver | 1100–1299 |
| 🥇 Gold | 1300–1499 |
| 💎 Platinum | 1500–1699 |
| 💠 Diamond | 1700–1899 |
| 🔮 Master | 1900–2099 |
| ⚔️ Grandmaster | 2100+ |

**ELO Changes:** Win +25 | Loss -15

---

## ⚡ Code Execution

- **Mock mode** (no API key): Returns `Accepted` with a message — great for development
- **Judge0 mode**: Set `JUDGE0_KEY` in `.env` for real sandboxed execution
- Supports: Java, C++

---

## 🔌 Socket Events

| Event | Direction | Description |
|---|---|---|
| `battle:join` | Client→Server | Join a room |
| `battle:start` | Client→Server | Start countdown |
| `battle:updated` | Server→Client | Battle state changed |
| `battle:countdown` | Server→Client | 3→2→1→FIGHT |
| `timer:tick` | Server→Client | Every second |
| `editor:typing` | Client→Server | Typing indicator |
| `opponent:typing` | Server→Client | Show typing dots |
| `submission:result` | Server→Client | Code result + AI coach |
| `integrity:violation` | Server→Client | Cheat detection |

---

## 🛡️ Anti-Cheat System

Automatically monitors during live battles:
1. **Tab switching** → Warning → Disqualification
2. **Fullscreen exit** → Warning
3. **Copy/paste** → Blocked + logged
4. **Right-click** → Blocked
5. **Keyboard shortcuts** (Ctrl+C, Ctrl+V, F12) → Blocked

---

## 🚀 Deployment

**Frontend → Vercel:**
```bash
cd frontend && npm run build
# Deploy `dist/` to Vercel
```

**Backend → Render / Railway:**
```bash
# Set env vars in dashboard
# Start command: node server.js
```

**Database → MongoDB Atlas:**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/codearena
```

---

*Built with ❤️ for the next generation of competitive programmers.*
