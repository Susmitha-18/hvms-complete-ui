import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  startTime: Date,
  stopTime: Date,
  status: { type: String, enum: ["Active", "Completed"], default: "Active" },
});

export default mongoose.model("Assignment", assignmentSchema);
