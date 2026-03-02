import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  mode: String,
  wordLimit: Number,
  timeLimit: Number,
  rawWPM: Number,
  netWPM: Number,
  accuracy: Number,
  correct: Number,
  incorrect: Number,
  extra: Number,
  missed: Number,
  stabilityScore: Number,
  weakKeys: [String]
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);