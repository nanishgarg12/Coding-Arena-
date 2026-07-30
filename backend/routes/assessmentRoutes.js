import { Router } from "express";
import { candidateReport, createAssessment, listAssessments } from "../controllers/assessmentController.js";
import { protect, recruiterOnly } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect, recruiterOnly);
router.get("/", listAssessments);
router.post("/", createAssessment);
router.get("/:id/report", candidateReport);
export default router;
