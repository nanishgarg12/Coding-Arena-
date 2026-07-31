import { useCallback, useEffect, useRef, useState } from "react";
import { battleApi } from "../services/api.js";

export function useAntiCheat(roomCode, active = true) {
  const [violations, setViolations] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [disqualified, setDisqualified] = useState(false);
  const lock = useRef(false);
  const warningTimeout = useRef(null);

  const log = useCallback(
    async (type, metadata = {}) => {
      if (!active || !roomCode || lock.current || roomCode === "demo") return;
      lock.current = true;
      try {
        const { data } = await battleApi.violation(roomCode, { type, metadata });
        const newLog = data.log;
        setViolations((prev) => [newLog, ...prev].slice(0, 6));

        setShowWarning(true);
        clearTimeout(warningTimeout.current);
        warningTimeout.current = setTimeout(() => setShowWarning(false), 4000);

        if (newLog.severity === "disqualified") {
          setDisqualified(true);
        }
      } catch {
        // Silently fail — network errors should not crash the editor
      } finally {
        setTimeout(() => { lock.current = false; }, 1500);
      }
    },
    [active, roomCode]
  );

  useEffect(() => {
    if (!active) return undefined;

    const onVisibility = () => {
      if (document.hidden) {
        log("TAB_SWITCH", { timestamp: new Date().toISOString() });
      }
    };

    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        log("EXIT_FULLSCREEN", { timestamp: new Date().toISOString() });
      }
    };

    const onBlur = () => log("WINDOW_BLUR", { timestamp: new Date().toISOString() });

    const prevent = (event) => {
      event.preventDefault();
      const typeMap = {
        copy: "COPY",
        paste: "PASTE",
        contextmenu: "RIGHT_CLICK",
      };
      const type = typeMap[event.type];
      if (type) log(type);
    };

    const preventKey = (event) => {
      if (
        (event.ctrlKey && ["c", "v", "a", "u"].includes(event.key.toLowerCase())) ||
        event.key === "F12"
      ) {
        event.preventDefault();
        if (event.ctrlKey && event.key.toLowerCase() === "c") log("COPY");
        if (event.ctrlKey && event.key.toLowerCase() === "v") log("PASTE");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("blur", onBlur);
    ["copy", "paste", "contextmenu"].forEach((e) =>
      document.addEventListener(e, prevent)
    );
    document.addEventListener("keydown", preventKey);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("blur", onBlur); // ← Fixed: was never removed before
      ["copy", "paste", "contextmenu"].forEach((e) =>
        document.removeEventListener(e, prevent)
      );
      document.removeEventListener("keydown", preventKey);
      clearTimeout(warningTimeout.current);
    };
  }, [active, log]);

  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
  }, []);

  return {
    violations,
    showWarning,
    disqualified,
    requestFullscreen,
    exitFullscreen,
    violationCount: violations.length,
    isFullscreen: !!document.fullscreenElement,
  };
}
