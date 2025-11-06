import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    empId: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    month: {
      type: String,
      required: true,
      default: () => new Date().toISOString().slice(0, 7), // YYYY-MM
    },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

// ✅ Ensure one record per employee per month
salarySchema.index({ empId: 1, month: 1 }, { unique: true });

// Prevent model overwrite during hot reload
const Salary = mongoose.models.Salary || mongoose.model("Salary", salarySchema);
export default Salary;
