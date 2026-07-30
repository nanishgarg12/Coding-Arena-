const roomTimers = new Map();

export function registerBattleSocket(io) {
  io.on("connection", (socket) => {
    socket.on("battle:join", ({ roomCode, user }) => {
      socket.join(roomCode);
      socket.to(roomCode).emit("player:joined", { user });
    });

    socket.on("battle:spectate", ({ roomCode, user }) => {
      socket.join(roomCode);
      socket.to(roomCode).emit("spectator:joined", { user });
    });

    socket.on("battle:start", ({ roomCode, durationMinutes }) => {
      let count = 3;
      const countdown = setInterval(() => {
        io.to(roomCode).emit("battle:countdown", count > 0 ? count : "FIGHT");
        count -= 1;
        if (count < -1) {
          clearInterval(countdown);
          startTimer(io, roomCode, durationMinutes);
        }
      }, 1000);
    });

    socket.on("editor:typing", ({ roomCode, userId, isTyping }) => {
      socket.to(roomCode).emit("opponent:typing", { userId, isTyping });
    });

    socket.on("submission:status", ({ roomCode, userId, status, testCasesPassed }) => {
      socket.to(roomCode).emit("opponent:submission", { userId, status, testCasesPassed });
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomCode) => {
        if (roomCode !== socket.id) socket.to(roomCode).emit("player:offline", { socketId: socket.id });
      });
    });
  });
}

function startTimer(io, roomCode, durationMinutes) {
  if (roomTimers.has(roomCode)) clearInterval(roomTimers.get(roomCode));
  const endsAt = Date.now() + durationMinutes * 60 * 1000;
  const timer = setInterval(() => {
    const remainingMs = Math.max(0, endsAt - Date.now());
    io.to(roomCode).emit("timer:tick", {
      remainingSeconds: Math.ceil(remainingMs / 1000),
      phase: remainingMs <= 30_000 ? "critical" : remainingMs <= 300_000 ? "warning" : "normal"
    });
    if (remainingMs <= 0) {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      io.to(roomCode).emit("battle:timeup");
    }
  }, 1000);
  roomTimers.set(roomCode, timer);
}
