import express from "express";
import { createSession, getSessions, getSingleSession } from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSession);
router.get("/", protect, getSessions);
router.get("/:id", protect, getSingleSession);

export default router;