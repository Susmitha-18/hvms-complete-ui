import express from "express";
import MaintenanceRecord from "../models/MaintenanceRecord.js";
import multer from "multer";
import fs from "fs";
import mongoose from "mongoose";

const router = express.Router();

/* 🗂 Ensure uploads folder exists */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("📁 Created uploads folder");
}

/* 🧰 Multer setup for file uploads */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ✅ Utility: Convert vehicleId safely */
function normalizeVehicleId(data) {
  if (data.vehicleId && typeof data.vehicleId === "string") {
    try {
      data.vehicleId = new mongoose.Types.ObjectId(data.vehicleId);
    } catch {
      console.warn("⚠️ Invalid vehicleId format, skipping ObjectId conversion.");
    }
  } else if (data.vehicleId && typeof data.vehicleId === "object" && data.vehicleId._id) {
    // If it's a populated object
    data.vehicleId = data.vehicleId._id;
  }
}

/* ✅ POST: Add new maintenance record */
router.post("/", upload.single("billFile"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.billFile = req.file.filename;

    normalizeVehicleId(data);

    console.log("📩 Creating new maintenance record:", data);

    const record = new MaintenanceRecord(data);
    await record.save();

    res.status(201).json({
      message: "Record added successfully",
      record: await record.populate("vehicleId", "name vehicleId"),
    });
  } catch (err) {
    console.error("❌ Error adding record:", err);
    res.status(500).json({ message: "Failed to add record", error: err.message });
  }
});
// ✅ PUT: Update existing record
router.put("/:id", upload.single("billFile"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.billFile = req.file.filename;

    if (Array.isArray(data.vehicleId)) data.vehicleId = data.vehicleId[0];
    normalizeVehicleId(data);

    console.log("🔄 Updating record:", req.params.id, data);

    const updated = await MaintenanceRecord.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Record not found" });

    res.status(200).json({
      message: "Record updated successfully",
      updated: await updated.populate("vehicleId", "name vehicleId"),
    });
  } catch (err) {
    console.error("❌ Error updating record:", err);
    res.status(500).json({ message: "Failed to update record", error: err.message });
  }
});

/* ✅ GET: All records for a vehicle */
router.get("/:vehicleId", async (req, res) => {
  try {
    const records = await MaintenanceRecord.find({
      vehicleId: req.params.vehicleId,
    }).sort({ createdAt: -1 });

    console.log("📜 Fetched records:", records.length);
    res.status(200).json({ records });
  } catch (err) {
    console.error("❌ Error fetching records:", err);
    res.status(500).json({ message: "Failed to fetch records", error: err.message });
  }
});

export default router;
