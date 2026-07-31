import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Bot, CheckCircle, Clipboard,
  Maximize2, Play, Send, Shield, Swords, XCircle, Zap
} from "lucide-react";
import { battleApi } from "../services/api.js";
import { getSocket } from "../services/socket.js";
import { useAntiCheat } from "../hooks/useAntiCheat.js";
import { formatTimer } from "../utils/ranks.js";
import { useAuth } from "../context/AuthContext.jsx";
import WinnerModal from "../components/WinnerModal.jsx";

// ── Fallback problem shown while battle loads or in demo mode ────────────────
const FALLBACK_PROBLEM = {
  title: "Two Sum",
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  difficulty: "Easy",
  category: "ARRAY",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] = 2 + 7 = 9",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] = 2 + 4 = 6",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
  starterCode: {
    Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
    "C++": `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
  },
};

export default function LiveArenaPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const socket = useMemo(() => getSocket(), []);
  const isDemo = roomCode === "demo";

  const [battle, setBattle] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadRetries, setLoadRetries] = useState(0);
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState(FALLBACK_PROBLEM.starterCode.Java);
  const [timer, setTimer] = useState(30 * 60);
  const [phase, setPhase] = useState("normal");
  const [consoleOutput, setConsoleOutput] = useState(
    "// Console ready. Run your code to see output here."
  );
  const [consoleStatus, setConsoleStatus] = useState(null);
  const [coach, setCoach] = useState(null);
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [opponentTestsPassed, setOpponentTestsPassed] = useState(0);
  const [opponentAccepted, setOpponentAccepted] = useState(false);
  const [opponentName, setOpponentName] = useState(null);
  const [winner, setWinner] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const typingTimeout = useRef(null);
  const { violations, showWarning, disqualified, requestFullscreen } =
    useAntiCheat(roomCode, !isDemo);

  // The problem to display — real or fallback
  const problem = battle?.problem ?? FALLBACK_PROBLEM;

  // ── Load battle from API ─────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) return;

    let cancelled = false;

    async function loadBattle() {
      try {
        const { data } = await battleApi.get(roomCode);
        if (cancelled) return;
        setBattle(data.battle);
        setLoadError(null);

        // Set opponent name
        const opp = data.battle?.participants?.find(
          (p) => p.user?._id !== user?._id && p.user?.username
        );
        if (opp?.user?.username) setOpponentName(opp.user.username);

        // Set starter code if available
        const starter = data.battle?.problem?.starterCode?.[language];
        if (starter) setCode(starter);
      } catch (err) {
        if (cancelled) return;
        setLoadError("Failed to load battle. Retrying…");
      }
    }

    loadBattle();
    return () => { cancelled = true; };
  }, [roomCode, isDemo, loadRetries]); // eslint-disable-line

  // ── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    socket.emit("battle:join", { roomCode });

    const onBattleUpdated = (updated) => {
      setBattle(updated);
      const opp = updated?.participants?.find(
        (p) => p.user?._id !== user?._id && p.user?.username
      );
      if (opp?.user?.username) setOpponentName(opp.user.username);
    };

    const onTimerTick = ({ remainingSeconds, phase: p }) => {
      setTimer(remainingSeconds);
      setPhase(p);
    };

    const onSubmissionResult = ({ userId, result, coach: c, winnerPayload }) => {
      const isOpponent = userId !== user?._id;
      if (isOpponent) {
        setOpponentTestsPassed(result?.status === "Accepted" ? 99 : 0);
        if (result?.status === "Accepted") setOpponentAccepted(true);
      }
      if (winnerPayload) setWinner(winnerPayload);
      if (c && !isOpponent) setCoach(c);
    };

    const onOpponentTyping = ({ isTyping }) => {
      setOpponentTyping(isTyping);
      clearTimeout(typingTimeout.current);
      if (isTyping)
        typingTimeout.current = setTimeout(
          () => setOpponentTyping(false),
          2000
        );
    };

    const onTimeup = () => {
      setPhase("critical");
      setTimer(0);
    };

    const onIntegrityViolation = ({ userId: uid }) => {
      if (uid === user?._id) return; // handled by anti-cheat hook
    };

    socket.on("battle:updated", onBattleUpdated);
    socket.on("timer:tick", onTimerTick);
    socket.on("submission:result", onSubmissionResult);
    socket.on("opponent:typing", onOpponentTyping);
    socket.on("battle:timeup", onTimeup);
    socket.on("integrity:violation", onIntegrityViolation);

    return () => {
      socket.off("battle:updated", onBattleUpdated);
      socket.off("timer:tick", onTimerTick);
      socket.off("submission:result", onSubmissionResult);
      socket.off("opponent:typing", onOpponentTyping);
      socket.off("battle:timeup", onTimeup);
      socket.off("integrity:violation", onIntegrityViolation);
    };
  }, [roomCode, socket, user?._id]);

  // ── Language switch ───────────────────────────────────────────────────────
  function handleLangChange(lang) {
    setLanguage(lang);
    const starter =
      battle?.problem?.starterCode?.[lang] ?? FALLBACK_PROBLEM.starterCode[lang];
    if (starter) setCode(starter);
  }

  // ── Run / Submit ──────────────────────────────────────────────────────────
  async function run(submit = false) {
    if (submit) setSubmitting(true);
    else setRunning(true);
    setConsoleOutput("// Executing…");
    setConsoleStatus(null);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 900));
      setConsoleOutput(
        "// ✓ Accepted\n// Mock execution passed in demo mode.\n// Time: 0.042s | Memory: 38MB"
      );
      setConsoleStatus("accepted");
      setCoach({
        summary: "Your solution looks good for demo mode!",
        complexity: "O(n) time, O(n) space — HashMap approach optimal.",
        feedback:
          "In an interview, explain your invariants clearly. HashMap approach reduces brute-force O(n²) to O(n).",
        hint: "For Two Sum: iterate once, store complement in a HashMap, check on each step.",
      });
      setRunning(false);
      setSubmitting(false);
      return;
    }

    try {
      const { data } = await battleApi.submit(roomCode, {
        language,
        code,
        submit,
      });
      const accepted = data.result?.status === "Accepted";
      setConsoleStatus(accepted ? "accepted" : "failed");
      const stdout = data.result?.stdout ?? "";
      const stderr = data.result?.stderr ?? "";
      const time = data.result?.time ?? "—";
      const mem = data.result?.memory ?? "—";
      setConsoleOutput(
        `// Status: ${data.result?.status ?? "Unknown"}\n${stdout}${
          stderr ? `\n// Error:\n${stderr}` : ""
        }\n// Time: ${time}s | Memory: ${mem}KB`
      );
      if (data.coach) setCoach(data.coach);
    } catch (err) {
      setConsoleStatus("failed");
      const msg =
        err?.response?.data?.message ?? "Execution error. Check your code.";
      setConsoleOutput(`// ✗ ${msg}`);
    } finally {
      setRunning(false);
      setSubmitting(false);
    }
  }

  // ── Timer CSS class ───────────────────────────────────────────────────────
  const timerClass =
    phase === "critical"
      ? "timer-critical"
      : phase === "warning"
      ? "timer-warning"
      : "timer-normal";

  return (
    <section className="relative min-h-[calc(100vh-2.5rem)]">
      {/* Anti-cheat warning toast */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl border border-arena-red/50 bg-arena-red/15 px-5 py-3 text-sm font-semibold text-arena-red backdrop-blur-xl"
          >
            <AlertTriangle size={16} />
            Integrity violation detected —{" "}
            {violations.length === 1 ? "Warning" : "Disqualification"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner modal */}
      {winner && (
        <WinnerModal
          isWinner={winner.winner?.toString() === user?._id?.toString()}
          opponentName={
            opponentName ??
            battle?.participants?.find(
              (p) => p.user?._id !== user?._id
            )?.user?.username ??
            "Opponent"
          }
          onClose={() => setWinner(null)}
        />
      )}

      {/* Load error banner with retry */}
      {loadError && !battle && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-arena-red/30 bg-arena-red/10 px-4 py-3 text-sm text-arena-red">
          <span>{loadError}</span>
          <button
            onClick={() => setLoadRetries((n) => n + 1)}
            className="ml-4 rounded-lg border border-arena-red/40 px-3 py-1 text-xs font-semibold hover:bg-arena-red/20 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono rounded border border-arena-cyan/20 bg-arena-cyan/10 px-2 py-0.5 text-xs font-semibold text-arena-cyan">
              {roomCode}
            </span>
            {isDemo && (
              <span className="rounded border border-arena-gold/20 bg-arena-gold/10 px-2 py-0.5 text-xs font-semibold text-arena-gold">
                DEMO MODE
              </span>
            )}
            {battle?.status && (
              <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs capitalize text-slate-400">
                {battle.status}
              </span>
            )}
          </div>
          <h1 className="mt-1 font-display text-2xl font-black">
            Live Coding Arena
          </h1>
        </div>

        {/* Timer */}
        <div
          className={`mono rounded-xl border px-5 py-2.5 text-2xl font-black transition-all ${timerClass}`}
        >
          {formatTimer(timer)}
        </div>
      </div>

      {/* 3-Col Layout */}
      <div className="grid min-h-[75vh] gap-3 xl:grid-cols-[340px_1fr_280px]">
        {/* LEFT: Problem Panel */}
        <aside className="glass max-h-[80vh] overflow-auto rounded-xl p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    problem.difficulty === "Easy"
                      ? "text-arena-green"
                      : problem.difficulty === "Hard" ||
                        problem.difficulty === "Expert"
                      ? "text-arena-red"
                      : "text-arena-gold"
                  }`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-xs text-slate-500">
                  · {problem.category}
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl font-black">
                {problem.title}
              </h2>
            </div>
          </div>

          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-sm leading-7 text-slate-300">
              {problem.description}
            </p>

            {problem.examples?.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-bold text-arena-cyan">
                  Examples
                </h3>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="mt-2 rounded-lg border border-white/5 bg-black/40 p-3"
                  >
                    <pre className="whitespace-pre-wrap text-xs text-slate-300">
                      {`Input:  ${ex.input}\nOutput: ${ex.output}`}
                      {ex.explanation
                        ? `\nExplan: ${ex.explanation}`
                        : ""}
                    </pre>
                  </div>
                ))}
              </>
            )}

            {problem.constraints?.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-bold text-arena-cyan">
                  Constraints
                </h3>
                <ul className="mt-2 space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-arena-cyan">·</span> {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        {/* CENTER: Editor */}
        <main className="editor-chrome flex flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between border-b border-white/8 bg-[#07101f] px-3 py-2">
            <div className="flex gap-1.5">
              {["Java", "C++"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangChange(lang)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    language === lang
                      ? "border border-arena-cyan/30 bg-arena-cyan/15 text-arena-cyan"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestFullscreen}
                title="Fullscreen"
                className="rounded-lg border border-white/8 p-1.5 text-slate-500 transition-all hover:border-arena-cyan/30 hover:text-arena-cyan"
              >
                <Maximize2 size={14} />
              </button>
              <button
                id="run-btn"
                onClick={() => run(false)}
                disabled={running || submitting}
                className="flex items-center gap-1.5 rounded-lg border border-arena-green/40 bg-arena-green/10 px-3 py-1.5 text-xs font-bold text-arena-green transition-all hover:bg-arena-green/20 disabled:opacity-50"
              >
                {running ? (
                  <span className="h-3 w-3 animate-spin rounded-full border border-arena-green border-t-transparent" />
                ) : (
                  <Play size={13} />
                )}
                Run
              </button>
              <button
                id="submit-btn"
                onClick={() => run(true)}
                disabled={submitting || running}
                className="flex items-center gap-1.5 rounded-lg bg-arena-cyan px-3 py-1.5 text-xs font-black text-arena-bg shadow-neon transition-all hover:bg-[#33ecff] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-3 w-3 animate-spin rounded-full border border-arena-bg border-t-transparent" />
                ) : (
                  <Send size={13} />
                )}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "Java" ? "java" : "cpp"}
              value={code}
              onChange={(val) => {
                setCode(val ?? "");
                socket.emit("editor:typing", { roomCode, isTyping: true });
              }}
              options={{
                minimap: { enabled: false },
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                lineHeight: 22,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                cursorStyle: "line",
                renderLineHighlight: "gutter",
                smoothScrolling: true,
                contextmenu: false,
              }}
            />
          </div>

          {/* Console */}
          <div
            className="border-t border-white/8 bg-[#050c18] transition-all"
            style={{ minHeight: "120px", maxHeight: "180px" }}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Console
              </span>
              {consoleStatus && (
                <span
                  className={`flex items-center gap-1 text-xs font-bold ${
                    consoleStatus === "accepted"
                      ? "text-arena-green"
                      : "text-arena-red"
                  }`}
                >
                  {consoleStatus === "accepted" ? (
                    <CheckCircle size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {consoleStatus === "accepted" ? "Accepted" : "Failed"}
                </span>
              )}
            </div>
            <pre className="mono h-[calc(100%-32px)] overflow-auto whitespace-pre-wrap p-3 text-xs leading-6 text-slate-300">
              {consoleOutput}
            </pre>
          </div>
        </main>

        {/* RIGHT: Battle Panel */}
        <aside className="space-y-3">
          {/* Opponent Status */}
          <div className="glass rounded-xl p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-black">
              <Swords size={14} className="text-arena-red" /> Battle Status
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Opponent</span>
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    opponentAccepted ? "text-arena-red" : "text-arena-green"
                  }`}
                >
                  {opponentAccepted ? "✓ Solved!" : "● Online"}
                </span>
              </div>
              {opponentName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Name</span>
                  <span className="font-semibold text-white">
                    {opponentName}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Typing</span>
                {opponentTyping ? (
                  <span className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">Idle</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tests Passed</span>
                <span className="font-bold text-arena-cyan">
                  {opponentTestsPassed}
                </span>
              </div>
            </div>
            {opponentAccepted && (
              <div className="mt-3 rounded-lg border border-arena-red/30 bg-arena-red/10 p-2 text-center text-xs font-semibold text-arena-red">
                ⚠️ Opponent solved it! Hurry!
              </div>
            )}
          </div>

          {/* AI Coach */}
          <div className="glass rounded-xl p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-black">
              <Bot size={14} className="text-arena-purple" /> AI Coach
            </h3>
            {coach ? (
              <div className="space-y-2 text-xs">
                <p className="leading-5 text-slate-300">{coach.summary}</p>
                {coach.complexity && (
                  <p className="font-semibold text-arena-cyan">
                    <Zap size={11} className="mr-1 inline" />
                    {coach.complexity}
                  </p>
                )}
                {coach.feedback && (
                  <p className="border-t border-white/5 pt-2 leading-5 text-slate-400">
                    {coach.feedback}
                  </p>
                )}
                {coach.hint && (
                  <p className="leading-5 text-arena-gold">
                    💡 {coach.hint}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Run or submit your code to get AI feedback.
              </p>
            )}
          </div>

          {/* Integrity Monitor */}
          <div className="glass rounded-xl p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-black">
              <Shield size={14} className="text-arena-green" /> Integrity
            </h3>
            {violations.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-arena-green">
                <CheckCircle size={12} /> Clean session
              </div>
            ) : (
              <div className="space-y-1.5">
                {violations.map((v, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 text-xs ${
                      v.severity === "disqualified"
                        ? "text-arena-red"
                        : "text-arena-gold"
                    }`}
                  >
                    <AlertTriangle size={11} />
                    <span className="capitalize">{v.severity}:</span>{" "}
                    {v.type?.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            )}
            {disqualified && (
              <div className="mt-2 rounded-lg border border-arena-red/30 bg-arena-red/15 p-2 text-center text-xs font-bold text-arena-red">
                ⛔ Disqualified
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
