import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./srcApp.js";
import connectDB from "./config/db.js";
import { registerBattleSocket } from "./socket/battleSocket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const clientOrigins = CLIENT_URL
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      ...clientOrigins,
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

app.set("io", io);
registerBattleSocket(io);

// Connect DB (non-blocking)
connectDB();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n⚔️  CodeArena API running on port ${PORT}`);
  console.log(`   Allowed origin: ${CLIENT_URL}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});
