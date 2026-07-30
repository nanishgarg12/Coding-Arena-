import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let globalSocket = null;

export function getSocket() {
  if (!globalSocket) {
    globalSocket = io(
      import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000",
      {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true,
        auth: { token: localStorage.getItem("codearena_token") },
      }
    );
  }
  return globalSocket;
}

export function useSocket(roomCode, handlers = {}) {
  const socket = useRef(getSocket());
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const s = socket.current;

    if (roomCode) s.emit("battle:join", { roomCode });

    const attached = Object.entries(handlersRef.current).map(([event, fn]) => {
      const wrapped = (...args) => fn(...args);
      s.on(event, wrapped);
      return [event, wrapped];
    });

    return () => {
      attached.forEach(([event, fn]) => s.off(event, fn));
    };
  }, [roomCode]);

  return socket.current;
}
