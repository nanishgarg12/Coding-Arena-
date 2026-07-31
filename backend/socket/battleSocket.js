import Battle from "../models/Battle.js";

const roomTimers = new Map();

export function registerBattleSocket(io) {
  io.on("connection", (socket) => {
    // ── Join a battle room ─────────────────────────────────────────────────
    socket.on("battle:join", ({ roomCode, user }) => {
      if (!roomCode) return;
      socket.join(roomCode);
      socket.to(roomCode).emit("player:joined", { user });
    });

    // ── Spectator join ─────────────────────────────────────────────────────
    socket.on("battle:spectate", ({ roomCode, user }) => {
      if (!roomCode) return;
      socket.join(roomCode);
      socket.to(roomCode).emit("spectator:joined", { user });
    });

    // ── Host starts battle: countdown then timer ───────────────────────────
    socket.on("battle:start", async ({ roomCode, durationMinutes = 30 }) => {
      if (!roomCode) return;

      // Update battle status to countdown in DB
      try {
        await Battle.findOneAndUpdate(
          { roomCode },
          { status: "countdown" }
        );
      } catch (_) { /* non-fatal */ }

      let count = 3;
      // Emit 3, 2, 1, then "FIGHT", then start timer
      const countdown = setInterval(() => {
        if (count > 0) {
          io.to(roomCode).emit("battle:countdown", count);
          count -= 1;
        } else {
          io.to(roomCode).emit("battle:countdown", "FIGHT");
          clearInterval(countdown);
          // Update DB to "live"
          Battle.findOneAndUpdate(
            { roomCode },
            { status: "live", startedAt: new Date(), endsAt: new Date(Date.now() + durationMinutes * 60_000) }
          ).catch(() => {});
          startTimer(io, roomCode, durationMinutes);
        }
      }, 1000);
    });

    // ── Typing indicator ───────────────────────────────────────────────────
    socket.on("editor:typing", ({ roomCode, userId, isTyping }) => {
      if (!roomCode) return;
      socket.to(roomCode).emit("opponent:typing", { userId, isTyping });
    });

    // ── Submission status broadcast ────────────────────────────────────────
    socket.on("submission:status", ({ roomCode, userId, status, testCasesPassed }) => {
      if (!roomCode) return;
      socket.to(roomCode).emit("opponent:submission", { userId, status, testCasesPassed });
    });

    // ── Disconnect: notify room members ───────────────────────────────────
    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomCode) => {
        if (roomCode !== socket.id) {
          socket.to(roomCode).emit("player:offline", { socketId: socket.id });
        }
      });
    });
  });
}

// ── Per-room countdown timer ─────────────────────────────────────────────────
function startTimer(io, roomCode, durationMinutes) {
  // Clear any existing timer for this room
  if (roomTimers.has(roomCode)) {
    clearInterval(roomTimers.get(roomCode));
    roomTimers.delete(roomCode);
  }

  const endsAt = Date.now() + durationMinutes * 60 * 1000;

  const timer = setInterval(() => {
    const remainingMs = Math.max(0, endsAt - Date.now());
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    io.to(roomCode).emit("timer:tick", {
      remainingSeconds,
      phase:
        remainingMs <= 30_000
          ? "critical"
          : remainingMs <= 300_000
          ? "warning"
          : "normal",
    });

    if (remainingMs <= 0) {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      io.to(roomCode).emit("battle:timeup");
      // Update battle status to completed in DB
      Battle.findOneAndUpdate(
        { roomCode, status: "live" },
        { status: "completed" }
      ).catch(() => {});
    }
  }, 1000);

  roomTimers.set(roomCode, timer);
}
