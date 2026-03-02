import express from "express";
import { createSession, getSessions } from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSession);
router.get("/", protect, getSessions);

export default router;