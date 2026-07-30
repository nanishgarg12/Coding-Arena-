import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    score: { type: Number, default: 0 },
    timeMinutes: { type: Number, default: 0 },
    integrityScore: { type: Number, default: 100 },
    solvedProblems: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] }
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: String,
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    candidates: { type: [candidateSchema], default: [] },
    startsAt: Date,
    endsAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);
