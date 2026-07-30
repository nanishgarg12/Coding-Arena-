import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    team: { type: Number, default: 1 },
    ready: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    accepted: { type: Boolean, default: false },
    completedAt: Date,
    testCasesPassed: { type: Number, default: 0 },
    disqualified: { type: Boolean, default: false }
  },
  { _id: false }
);

const battleSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    visibility: { type: String, enum: ["private", "public"], default: "public" },
    battleType: { type: String, enum: ["1 VS 1", "2 VS 2 Team Battle", "3 VS 3 Team Battle", "Tournament"], default: "1 VS 1" },
    maxPlayers: { type: Number, default: 2 },
    difficulty: { type: String, enum: ["Beginner", "Easy", "Medium", "Hard", "Expert"], default: "Easy" },
    durationMinutes: { type: Number, default: 30 },
    languages: { type: [String], enum: ["Java", "C++"], default: ["Java", "C++"] },
    category: { type: String, default: "DSA" },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: { type: [participantSchema], default: [] },
    spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["lobby", "countdown", "live", "completed", "cancelled"], default: "lobby" },
    startedAt: Date,
    endsAt: Date,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Battle", battleSchema);
