import mongoose from "mongoose";

const LoginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // your user model name
    required: true
  },
  username: { type: String, required: true },
  role: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  loginTime: { type: Date, default: Date.now }
});

export default mongoose.model("LoginLog", LoginLogSchema);
