import { Router } from "express";
import { getProblem, listProblems } from "../controllers/problemController.js";

const router = Router();
router.get("/", listProblems);
router.get("/:slug", getProblem);
export default router;
