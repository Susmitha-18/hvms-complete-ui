import express from "express";
import SalaryModel from "../models/salaryModel.js";

const router = express.Router();

/**
 * ✅ Get all salary records
 */
router.get("/", async (req, res) => {
  try {
    const salaries = await SalaryModel.find().sort({ createdAt: -1 });
    res.status(200).json({ salary: salaries });
  } catch (err) {
    console.error("❌ Error fetching salaries:", err);
    res.status(500).json({ message: "Failed to fetch salaries" });
  }
});

/**
 * ✅ Add new salary record (creates a new sheet for each month)
 */
router.post("/", async (req, res) => {
  try {
    const { empId, name, amount, month } = req.body;

    console.log("📦 Trying to save salary record:", { empId, name, amount, month });

    if (!empId || !name || !amount || isNaN(amount)) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const targetMonth =
      month && typeof month === "string"
        ? month
        : new Date().toISOString().slice(0, 7); // YYYY-MM

    const existing = await SalaryModel.findOne({ empId, month: targetMonth });
    if (existing) {
      return res.status(400).json({
        message: `Salary already exists for ${name} (${targetMonth})`,
      });
    }

    const newSalary = new SalaryModel({
      empId,
      name,
      amount: Number(amount),
      month: targetMonth,
    });

    const savedSalary = await newSalary.save();
    console.log("✅ Salary saved:", savedSalary);
    console.log("✅ Salary saved with month:", savedSalary.month);

    // Verify the save by retrieving it back
    const verifyRecord = await SalaryModel.findById(savedSalary._id);
    console.log("✅ Verification read:", verifyRecord);

    res.status(201).json({
      message: "New salary record created successfully",
      salary: savedSalary,
    });
  } catch (err) {
    console.error("❌ Error saving salary:", err);
    res.status(500).json({ message: "Failed to save salary" });
  }
});

/**
 * ✅ Get salary history by month
 * Example: GET /api/salary/history?month=2025-10
 */
router.get("/history", async (req, res) => {
  try {
    const { month } = req.query;
    const query = month
      ? { month }
      : { month: new Date().toISOString().slice(0, 7) };

    console.log("🔍 Searching for salary history with query:", query);
    const history = await SalaryModel.find(query).sort({ name: 1 });
    console.log(`📊 Found ${history.length} salary records for month:`, month);

    if (!history.length) {
      return res.status(200).json({
        history: [],
        message: `No salary records found for ${month || "current month"}`,
      });
    }

    // Normalize records for frontend: some older records may use `workerId` or
    // different schema (e.g., created before `empId/name` were added). Ensure
    // `empId`, `name`, and timestamps exist so the UI can render them.
    const normalized = history.map((rec) => {
      // convert mongoose doc to plain object
      const obj = rec.toObject ? rec.toObject() : { ...rec };

      // empId fallback to workerId (legacy) or to empty string
      obj.empId = obj.empId || obj.workerId || obj.worker_id || "";

      // name fallback to existing name or username fields
      obj.name = obj.name || obj.username || obj.driverName || "Unknown";

      // createdAt/updatedAt fallback to ObjectId timestamp when missing
      if (!obj.createdAt && obj._id && obj._id.getTimestamp) {
        try {
          obj.createdAt = obj._id.getTimestamp();
        } catch (e) {
          // ignore
        }
      }
      if (!obj.updatedAt) obj.updatedAt = obj.createdAt || null;

      return obj;
    });

    res.status(200).json({ history: normalized });
  } catch (err) {
    console.error("❌ Error fetching salary history:", err);
    res.status(500).json({ message: "Failed to load salary history" });
  }
});

/**
 * ✅ Get salary for a specific employee across all months
 */
router.get("/employee/:empId", async (req, res) => {
  try {
    const { empId } = req.params;
    const records = await SalaryModel.find({ empId }).sort({ month: 1 });

    if (!records.length) {
      return res
        .status(404)
        .json({ message: "No salary records found for this employee" });
    }

    res.status(200).json({ salaries: records });
  } catch (err) {
    console.error("❌ Error fetching employee salary:", err);           
    res.status(500).json({ message: "Failed to fetch employee salary data" });
  }
});

/**
 * ✅ Delete salary record
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SalaryModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Salary record not found" });
    }
    res.status(200).json({ message: "Salary record deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting salary:", err);
    res.status(500).json({ message: "Failed to delete salary record" });
  }
});

export default router;
