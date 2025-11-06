import mongoose from "mongoose";

const { Schema } = mongoose;

const ContractSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    problem: { type: String, default: "" },
    contractAmount: { type: Number, required: true },
    durationDays: { type: Number, default: 0 },
    durationHours: { type: Number, default: 0 },
    location: { type: String, default: "" },
    status: { type: String, default: "Active" },
    workDate: { type: Date, required: true },
    endDate: { type: Date },

  },
  { timestamps: true }
);

const Contract = mongoose.models.Contract || mongoose.model("Contract", ContractSchema);

export default Contract;
