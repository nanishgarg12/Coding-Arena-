import Assessment from "../models/Assessment.js";
import { asyncHandler } from "../utils.js";

export const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.create({ ...req.body, recruiter: req.user._id });
  res.status(201).json({ assessment });
});

export const listAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ recruiter: req.user._id }).populate("problems", "title difficulty category");
  res.json({ assessments });
});

export const candidateReport = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  res.json({ candidates: assessment?.candidates || [] });
});
