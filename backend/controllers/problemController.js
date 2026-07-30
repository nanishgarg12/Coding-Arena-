import Problem from "../models/Problem.js";
import { asyncHandler } from "../utils.js";

export const listProblems = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.difficulty) query.difficulty = req.query.difficulty;
  const problems = await Problem.find(query).sort({ category: 1, difficulty: 1, title: 1 });
  res.json({ problems });
});

export const getProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ slug: req.params.slug });
  if (!problem) {
    res.status(404);
    throw new Error("Problem not found");
  }
  res.json({ problem });
});
