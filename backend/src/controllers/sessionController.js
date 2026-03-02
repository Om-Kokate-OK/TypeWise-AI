import Session from "../models/Sessions.js";

/* ---------------- CREATE SESSION ---------------- */
export const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      user: req.user,
      mode: req.body.mode,
      wordLimit: req.body.wordLimit,
      timeLimit: req.body.timeLimit,

      rawWPM: req.body.rawWPM,
      netWPM: req.body.netWPM,
      accuracy: req.body.accuracy,
      correct: req.body.correct,
      incorrect: req.body.incorrect,
      extra: req.body.extra,
      missed: req.body.missed,

      stabilityScore: req.body.stabilityScore,
      weakKeys: req.body.weakKeys,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET ALL SESSIONS ---------------- */
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user,
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET SINGLE SESSION ---------------- */
export const getSingleSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user,
    });

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};