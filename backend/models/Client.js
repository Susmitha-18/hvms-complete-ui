import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    industry: { type: String },
    status: { type: String, default: "Active" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
