import mongoose from "mongoose";

const driverAssignmentHistorySchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    clientName: {
      type: String,
      default: "",
    },
    clientAddress: {
      type: String,
      default: "",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    unassignedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "DriverAssignmentHistory",
  driverAssignmentHistorySchema
);
