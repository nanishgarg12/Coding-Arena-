import { Router } from "express";
import { createTournament, listTournaments, registerTournament } from "../controllers/tournamentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", listTournaments);
router.post("/", protect, createTournament);
router.post("/:id/register", protect, registerTournament);
export default router;
