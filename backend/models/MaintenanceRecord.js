import mongoose from "mongoose";

const maintenanceRecordSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    serviceType: String,
    replacedParts: String,
    billFile: String,
    totalCost: Number,
    description: String,
    serviceDate: Date,
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceRecord", maintenanceRecordSchema);
