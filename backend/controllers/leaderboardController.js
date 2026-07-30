import User from "../models/User.js";
import { asyncHandler } from "../utils.js";

export const leaderboard = asyncHandler(async (_req, res) => {
  const players = await User.find({ role: "player" })
    .select("username avatar rank elo wins losses xp level streak badges")
    .sort({ elo: -1, wins: -1 })
    .limit(100);
  res.json({ players });
});
