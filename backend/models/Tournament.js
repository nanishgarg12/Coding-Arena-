import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    difficulty: String,
    startsAt: Date,
    registrationClosesAt: Date,
    maxPlayers: { type: Number, default: 64 },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    registeredPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bracket: { type: Array, default: [] },
    leaderboard: { type: Array, default: [] },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["draft", "registration", "live", "completed"], default: "registration" }
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);
