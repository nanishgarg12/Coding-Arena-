import { Router } from "express";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.patch("/me", protect, updateProfile);
router.post("/logout", (_req, res) => res.json({ ok: true }));
export default router;
