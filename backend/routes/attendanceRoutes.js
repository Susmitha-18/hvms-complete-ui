import express from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Driver from "../models/Driver.js";

const router = express.Router();

// GET /api/attendance?date=YYYY-MM-DD
// Returns: { date, records: [{ driverId, status, _id }] }
router.get("/", async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ message: "Missing date query param" });
    const records = await Attendance.find({ date }).lean();
    res.json({ date, records });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
});

// GET /api/attendance/month-summary?month=YYYY-MM
// Returns month summary with total present days per driver
router.get("/month-summary", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: "Missing month parameter (YYYY-MM format)" });

    const summary = await Attendance.aggregate([
      { $match: { month } },
      { $group: {
        _id: "$driverId",
        totalPresentDays: {
          $sum: { $cond: [{ $eq: ["$status", "P"] }, 1, 0] }
        }
      }}
    ]);

    res.json({ 
      month, 
      summary: summary.reduce((acc, { _id, totalPresentDays }) => {
        acc[_id] = totalPresentDays;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error("Error fetching month summary:", err);
    res.status(500).json({ message: "Failed to fetch month summary" });
  }
});

// POST /api/attendance/mark
// Body: { date: 'YYYY-MM-DD', month: 'YYYY-MM', records: [{ driverId, status }] }
// Process each record individually using findOneAndUpdate with upsert to avoid bulkWrite
// partial failures and to provide per-record feedback.
router.post("/mark", async (req, res) => {
  try {
    const { date, month, records } = req.body || {};
    if (!date || !month || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Invalid payload: date, month, and records are required" });
    }

    console.log("Processing attendance mark request:", { date, month, recordCount: records.length });

    const results = [];

    for (const r of records) {
      try {
        // Basic validation/logging for easier debugging
        if (!r || !r.driverId) {
          console.warn("Skipping invalid record (missing driverId):", r);
          results.push({ driverId: r && r.driverId ? r.driverId : null, ok: false, error: "Invalid record: missing driverId" });
          continue;
        }

        console.log("Upserting attendance for record:", { driverId: r.driverId, date, month, status: r.status });
        // Ensure date and month are explicitly set when inserting so the schema
        // default (which reads `this.date`) is not relied upon during an upsert.
        // Use $set for mutable fields (status) and $setOnInsert for immutable/insert-only fields.
        const updated = await Attendance.findOneAndUpdate(
          { driverId: r.driverId, date },
          {
            $set: { status: r.status },
            $setOnInsert: { date, month, driverId: r.driverId }
          },
          { upsert: true, new: true }
        ).lean();

        results.push({ driverId: r.driverId, ok: true, status: updated.status, _id: updated._id });
        } catch (innerErr) {
          // Log full error with stack for easier debugging
          console.error("Failed to upsert attendance for", r.driverId, innerErr && innerErr.stack ? innerErr.stack : innerErr);
          results.push({ driverId: r.driverId, ok: false, error: innerErr && innerErr.message ? innerErr.message : String(innerErr), stack: innerErr && innerErr.stack ? innerErr.stack : null });
        }
    }

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      console.warn("Some attendance records failed to save:", failed);
      return res.status(500).json({ message: "Some attendance records failed to save", results });
    }

    res.json({ message: "Attendance marked successfully", results });
  } catch (err) {
    console.error("Error saving attendance (outer):", err);
    res.status(500).json({ message: "Failed to save attendance", error: err && err.message ? err.message : String(err) });
  }
});

export default router;
