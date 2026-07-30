import Tournament from "../models/Tournament.js";
import { asyncHandler } from "../utils.js";

export const listTournaments = asyncHandler(async (_req, res) => {
  const tournaments = await Tournament.find().populate("organizer registeredPlayers winner", "username rank elo").sort({ startsAt: 1 });
  res.json({ tournaments });
});

export const createTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.create({ ...req.body, organizer: req.user._id });
  res.status(201).json({ tournament });
});

export const registerTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament.registeredPlayers.some((id) => id.equals(req.user._id))) {
    tournament.registeredPlayers.push(req.user._id);
    await tournament.save();
  }
  res.json({ tournament });
});
