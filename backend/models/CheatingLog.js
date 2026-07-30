import mongoose from "mongoose";

const cheatingLogSchema = new mongoose.Schema(
  {
    battle: { type: mongoose.Schema.Types.ObjectId, ref: "Battle", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["TAB_SWITCH", "WINDOW_BLUR", "EXIT_FULLSCREEN", "COPY", "PASTE", "RIGHT_CLICK"], required: true },
    severity: { type: String, enum: ["warning", "disqualified"], default: "warning" },
    metadata: Object
  },
  { timestamps: true }
);

export default mongoose.model("CheatingLog", cheatingLogSchema);
