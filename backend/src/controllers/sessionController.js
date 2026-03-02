import Session from "../models/Sessions.js";

export const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      user: req.user,
      ...req.body
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user })
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};