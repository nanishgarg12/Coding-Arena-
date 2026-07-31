import { z } from "zod";
import Battle from "../models/Battle.js";
import Problem from "../models/Problem.js";
import CheatingLog from "../models/CheatingLog.js";
import User from "../models/User.js";
import { asyncHandler, createRoomCode } from "../utils.js";
import { runCode } from "../services/judgeService.js";
import { coachSubmission } from "../services/aiCoachService.js";
import { calculateWinner } from "../services/winnerService.js";

// ── Validation ───────────────────────────────────────────────────────────────
const createSchema = z.object({
  visibility: z.enum(["private", "public"]).default("public"),
  battleType: z.enum(["1 VS 1", "2 VS 2 Team Battle", "3 VS 3 Team Battle", "Tournament"]).default("1 VS 1"),
  maxPlayers: z.coerce.number().min(2).max(8).default(2),
  difficulty: z.enum(["Beginner", "Easy", "Medium", "Hard", "Expert"]).default("Easy"),
  durationMinutes: z.coerce.number().min(5).max(120).default(30),
  languages: z.array(z.enum(["Java", "C++"])).default(["Java", "C++"]),
  category: z.string().default("DSA"),
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const USER_FIELDS = "username avatar rank elo wins losses";
const PROBLEM_FIELDS = "title description difficulty category examples constraints starterCode tags acceptanceRate";

async function hydrateBattle(id) {
  return Battle.findById(id)
    .populate("host", USER_FIELDS)
    .populate("participants.user", USER_FIELDS)
    .populate("problem", PROBLEM_FIELDS)
    .lean();
}

// ── Controllers ──────────────────────────────────────────────────────────────

export const listPublicBattles = asyncHandler(async (_req, res) => {
  const battles = await Battle.find({ visibility: "public", status: "lobby" })
    .populate("host", USER_FIELDS)
    .populate("participants.user", USER_FIELDS)
    .populate("problem", "title difficulty category")
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();
  res.json({ battles });
});

export const createBattle = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);

  // Find a matching problem
  const problem = await Problem.findOne({
    difficulty: payload.difficulty,
    $or: [
      { category: { $regex: new RegExp(payload.category, "i") } },
      { tags: { $regex: new RegExp(payload.category, "i") } },
    ],
  }).sort({ acceptanceRate: -1 });

  // If no specific match, pick any problem of the right difficulty
  const fallbackProblem = problem ?? await Problem.findOne({ difficulty: payload.difficulty }).sort({ acceptanceRate: -1 });

  const battle = await Battle.create({
    ...payload,
    roomCode: createRoomCode(),
    host: req.user._id,
    problem: fallbackProblem?._id ?? undefined,
    participants: [{ user: req.user._id, ready: false, team: 1 }],
  });

  res.status(201).json({ battle: await hydrateBattle(battle._id) });
});

export const getBattle = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode })
    .populate("host", USER_FIELDS)
    .populate("participants.user", USER_FIELDS)
    .populate("problem", `${PROBLEM_FIELDS} testCases`)
    .lean();

  if (!battle) {
    res.status(404);
    throw new Error("Battle not found");
  }
  res.json({ battle });
});

export const joinBattle = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode });
  if (!battle) {
    res.status(404);
    throw new Error("Battle not found");
  }

  // Already in battle
  if (battle.participants.some((p) => p.user.equals(req.user._id))) {
    return res.json({ battle: await hydrateBattle(battle._id) });
  }

  // Battle full
  if (battle.participants.length >= battle.maxPlayers) {
    res.status(409);
    throw new Error("Battle is full");
  }

  // Battle already started
  if (battle.status !== "lobby") {
    res.status(409);
    throw new Error("Battle has already started");
  }

  const team = (battle.participants.length % 2) + 1;
  battle.participants.push({ user: req.user._id, team });
  await battle.save();

  const hydrated = await hydrateBattle(battle._id);
  req.app.get("io").to(battle.roomCode).emit("battle:updated", hydrated);
  res.json({ battle: hydrated });
});

export const setReady = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode });
  if (!battle) {
    res.status(404);
    throw new Error("Battle not found");
  }

  const participant = battle.participants.find((p) => p.user.equals(req.user._id));
  if (!participant) {
    res.status(404);
    throw new Error("You are not in this battle");
  }

  participant.ready = Boolean(req.body.ready);
  await battle.save();

  const hydrated = await hydrateBattle(battle._id);
  req.app.get("io").to(battle.roomCode).emit("battle:updated", hydrated);
  res.json({ battle: hydrated });
});

export const submitCode = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode }).populate("problem");
  if (!battle) {
    res.status(404);
    throw new Error("Battle not found");
  }

  const participant = battle.participants.find((p) => p.user.equals(req.user._id));
  if (!participant) {
    res.status(403);
    throw new Error("You are not a participant in this battle");
  }

  if (!battle.problem) {
    res.status(404);
    throw new Error("No problem assigned to this battle");
  }

  // Already accepted — don't resubmit
  if (participant.accepted) {
    return res.json({ result: { status: "Already Accepted" }, coach: null });
  }

  participant.attempts += 1;

  // Run code against first test case
  const firstTest = battle.problem.testCases?.[0];
  const result = await runCode({
    language: req.body.language,
    sourceCode: req.body.code,
    stdin: firstTest?.input || "",
  });

  const accepted = result.status === "Accepted";
  if (accepted) {
    participant.accepted = true;
    participant.testCasesPassed = battle.problem.testCases?.length ?? 1;
    if (!participant.completedAt) participant.completedAt = new Date();
  } else {
    participant.testCasesPassed = 0;
  }

  let winnerPayload = null;

  // Check if we have a winner
  if (accepted && battle.status === "live") {
    const winnerParticipant = calculateWinner(battle.participants.toObject ? battle.participants.toObject() : battle.participants);

    if (winnerParticipant?.user) {
      battle.winner = winnerParticipant.user;
      battle.status = "completed";

      // Update ELO for all participants
      await Promise.all(
        battle.participants.map(async (p) => {
          try {
            const userDoc = await User.findById(p.user);
            if (userDoc) {
              const didWin = p.user.equals(winnerParticipant.user);
              userDoc.applyBattleResult(didWin);
              await userDoc.save();
            }
          } catch (e) {
            console.error("ELO update failed for user:", p.user, e.message);
          }
        })
      );

      winnerPayload = { winner: winnerParticipant.user };
    }
  }

  await battle.save();

  const coach = await coachSubmission({
    code: req.body.code,
    language: req.body.language,
    result,
    problem: battle.problem,
  });

  const io = req.app.get("io");
  io.to(battle.roomCode).emit("submission:result", {
    userId: req.user._id.toString(),
    result,
    coach,
    winnerPayload,
  });

  res.json({ result, coach, battle: await hydrateBattle(battle._id) });
});

export const logViolation = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode });
  if (!battle) {
    res.status(404);
    throw new Error("Battle not found");
  }

  const existingCount = await CheatingLog.countDocuments({
    battle: battle._id,
    user: req.user._id,
  });
  const severity = existingCount >= 1 ? "disqualified" : "warning";

  const log = await CheatingLog.create({
    battle: battle._id,
    user: req.user._id,
    type: req.body.type || "UNKNOWN",
    severity,
    metadata: req.body.metadata || {},
  });

  if (severity === "disqualified") {
    const participant = battle.participants.find((p) =>
      p.user.equals(req.user._id)
    );
    if (participant) {
      participant.disqualified = true;
      await battle.save();
    }
  }

  req.app.get("io")
    .to(battle.roomCode)
    .emit("integrity:violation", { userId: req.user._id.toString(), log });

  res.status(201).json({ log });
});
