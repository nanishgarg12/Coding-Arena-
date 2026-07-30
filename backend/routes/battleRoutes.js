import { Router } from "express";
import { createBattle, getBattle, joinBattle, listPublicBattles, logViolation, setReady, submitCode } from "../controllers/battleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/public", listPublicBattles);
router.post("/", protect, createBattle);
router.get("/:roomCode", protect, getBattle);
router.post("/:roomCode/join", protect, joinBattle);
router.post("/:roomCode/ready", protect, setReady);
router.post("/:roomCode/submit", protect, submitCode);
router.post("/:roomCode/violations", protect, logViolation);
export default router;
