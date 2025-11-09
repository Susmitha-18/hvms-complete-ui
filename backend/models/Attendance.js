import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true },
    date: { type: String, required: true }, // store as YYYY-MM-DD
    month: {
      type: String,
      required: true
    },
    status: { type: String, enum: ["P", "A"], required: true },
  },
  { timestamps: true }
);

// Compound index for unique driver/date combination and efficient month queries
attendanceSchema.index({ driverId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ driverId: 1, month: 1 });

export default mongoose.model("Attendance", attendanceSchema);
