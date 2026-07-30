import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  { input: String, output: String, explanation: String },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  { input: String, expectedOutput: String, hidden: { type: Boolean, default: false } },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["Beginner", "Easy", "Medium", "Hard", "Expert"], required: true },
    category: { type: String, required: true },
    constraints: { type: [String], default: [] },
    examples: { type: [exampleSchema], default: [] },
    testCases: { type: [testCaseSchema], default: [] },
    starterCode: {
      Java: String,
      "C++": String
    },
    tags: [String],
    acceptanceRate: { type: Number, default: 50 }
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
