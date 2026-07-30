import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { rankFromElo } from "../utils.js";

const achievementSchema = new mongoose.Schema(
  { key: String, label: String, unlockedAt: { type: Date, default: Date.now } },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["player", "recruiter", "admin"], default: "player" },
    rank: { type: String, default: "Bronze" },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    elo: { type: Number, default: 1000 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    favoriteLanguage: { type: String, enum: ["Java", "C++"], default: "Java" },
    badges: { type: [String], default: ["Rookie"] },
    achievements: { type: [achievementSchema], default: [] },
    streak: { type: Number, default: 0 },
    lastActiveAt: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.applyBattleResult = function applyBattleResult(didWin) {
  this.elo = Math.max(0, this.elo + (didWin ? 25 : -15));
  this.rank = rankFromElo(this.elo);
  this.xp += didWin ? 120 : 45;
  this.level = Math.max(1, Math.floor(this.xp / 500) + 1);
  this.wins += didWin ? 1 : 0;
  this.losses += didWin ? 0 : 1;
  if (didWin && !this.achievements.some((a) => a.key === "FIRST_BLOOD")) {
    this.achievements.push({ key: "FIRST_BLOOD", label: "First Blood" });
  }
};

export default mongoose.model("User", userSchema);
