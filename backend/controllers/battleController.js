import { z } from "zod";
import Battle from "../models/Battle.js";
import Problem from "../models/Problem.js";
import CheatingLog from "../models/CheatingLog.js";
import User from "../models/User.js";
import { asyncHandler, createRoomCode } from "../utils.js";
import { runCode } from "../services/judgeService.js";
import { coachSubmission } from "../services/aiCoachService.js";
import { calculateWinner } from "../services/winnerService.js";

const createSchema = z.object({
  visibility: z.enum(["private", "public"]).default("public"),
  battleType: z.enum(["1 VS 1", "2 VS 2 Team Battle", "3 VS 3 Team Battle", "Tournament"]).default("1 VS 1"),
  maxPlayers: z.number().min(2).max(8).default(2),
  difficulty: z.enum(["Beginner", "Easy", "Medium", "Hard", "Expert"]).default("Easy"),
  durationMinutes: z.number().min(15).max(60).default(30),
  languages: z.array(z.enum(["Java", "C++"])).default(["Java", "C++"]),
  category: z.string().default("DSA")
});

export const listPublicBattles = asyncHandler(async (_req, res) => {
  const battles = await Battle.find({ visibility: "public", status: "lobby" })
    .populate("host participants.user problem", "username avatar rank elo title difficulty category")
    .sort({ createdAt: -1 })
    .limit(40);
  res.json({ battles });
});

export const createBattle = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  const problem = await Problem.findOne({
    difficulty: payload.difficulty,
    $or: [{ category: payload.category }, { tags: payload.category }]
  }).sort({ acceptanceRate: -1 });

  const battle = await Battle.create({
    ...payload,
    roomCode: createRoomCode(),
    host: req.user._id,
    problem: problem?._id,
    participants: [{ user: req.user._id, ready: false, team: 1 }]
  });

  res.status(201).json({ battle: await hydrateBattle(battle._id) });
});

export const getBattle = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode }).populate(
    "host participants.user problem spectators",
    "username avatar rank elo wins losses title description difficulty category examples constraints starterCode"
  );
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
  if (battle.participants.some((p) => p.user.equals(req.user._id))) {
    return res.json({ battle: await hydrateBattle(battle._id) });
  }
  if (battle.participants.length >= battle.maxPlayers) {
    res.status(409);
    throw new Error("Battle is full");
  }
  battle.participants.push({ user: req.user._id, team: (battle.participants.length % 2) + 1 });
  await battle.save();
  req.app.get("io").to(battle.roomCode).emit("battle:updated", await hydrateBattle(battle._id));
  res.json({ battle: await hydrateBattle(battle._id) });
});

export const setReady = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode });
  const participant = battle?.participants.find((p) => p.user.equals(req.user._id));
  if (!participant) {
    res.status(404);
    throw new Error("Participant not found");
  }
  participant.ready = Boolean(req.body.ready);
  await battle.save();
  req.app.get("io").to(battle.roomCode).emit("battle:updated", await hydrateBattle(battle._id));
  res.json({ battle: await hydrateBattle(battle._id) });
});

export const submitCode = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode }).populate("problem");
  const participant = battle?.participants.find((p) => p.user.equals(req.user._id));
  if (!participant || !battle.problem) {
    res.status(404);
    throw new Error("Battle participant or problem not found");
  }

  participant.attempts += 1;
  const result = await runCode({
    language: req.body.language,
    sourceCode: req.body.code,
    stdin: battle.problem.testCases?.[0]?.input || ""
  });
  const accepted = result.status === "Accepted";
  participant.accepted = accepted;
  participant.testCasesPassed = accepted ? battle.problem.testCases.length : 0;
  if (accepted && !participant.completedAt) participant.completedAt = new Date();

  let winnerPayload = null;
  if (accepted) {
    const winnerParticipant = calculateWinner(battle.participants);
    battle.winner = winnerParticipant.user;
    battle.status = "completed";
    await Promise.all(
      battle.participants.map(async (p) => {
        const user = await User.findById(p.user);
        user.applyBattleResult(p.user.equals(winnerParticipant.user));
        await user.save();
      })
    );
    winnerPayload = { winner: winnerParticipant.user };
  }

  await battle.save();
  const coach = await coachSubmission({ code: req.body.code, language: req.body.language, result, problem: battle.problem });
  req.app.get("io").to(battle.roomCode).emit("submission:result", { userId: req.user._id, result, coach, winnerPayload });
  res.json({ result, coach, battle: await hydrateBattle(battle._id) });
});

export const logViolation = asyncHandler(async (req, res) => {
  const battle = await Battle.findOne({ roomCode: req.params.roomCode });
  const count = await CheatingLog.countDocuments({ battle: battle._id, user: req.user._id });
  const severity = count >= 1 ? "disqualified" : "warning";
  const log = await CheatingLog.create({
    battle: battle._id,
    user: req.user._id,
    type: req.body.type,
    severity,
    metadata: req.body.metadata
  });
  if (severity === "disqualified") {
    const participant = battle.participants.find((p) => p.user.equals(req.user._id));
    if (participant) participant.disqualified = true;
    await battle.save();
  }
  req.app.get("io").to(battle.roomCode).emit("integrity:violation", { userId: req.user._id, log });
  res.status(201).json({ log });
});

async function hydrateBattle(id) {
  return Battle.findById(id).populate("host participants.user problem", "username avatar rank elo wins losses title description difficulty category examples constraints starterCode");
}
