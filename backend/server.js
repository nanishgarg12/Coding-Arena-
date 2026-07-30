import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./srcApp.js";
import connectDB from "./config/db.js";
import { registerBattleSocket } from "./socket/battleSocket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

app.set("io", io);
registerBattleSocket(io);

// Connect DB (non-blocking — server starts regardless)
connectDB();

server.listen(PORT, () => {
  console.log(`\n⚔️  CodeArena API listening on port ${PORT}`);
  console.log(`   Frontend: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`   Health:   http://localhost:${PORT}/health\n`);
});
