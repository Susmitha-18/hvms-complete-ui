import express from "express";
import Contract from "../models/Contract.js";
import Client from "../models/Client.js";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/* ---------------------------------------------------------
 ✅ POST — Add a new contract
--------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      clientId,
      problem,
      contractAmount,
      durationDays,
      durationHours,
      location,
      vehicleId,
      workDate,
    } = req.body;

    if (!clientId || !contractAmount || !vehicleId || !workDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert dates to start-of-day format for accurate comparison
const workDateObj = workDate ? new Date(workDate) : null;
if (!workDateObj || isNaN(workDateObj.getTime())) {
  return res.status(400).json({ message: "Invalid work date format" });
}
workDateObj.setHours(0, 0, 0, 0);


    // ✅ Prevent same vehicle assignment for same date
  // ✅ Prevent overlapping vehicle assignments for same or overlapping date ranges
const existingContract = await Contract.findOne({
  vehicleId,
  status: "Active",
  $or: [
    { workDate: { $lte: workDateObj }, endDate: { $gte: workDateObj } },
    { workDate: { $gte: workDateObj, $lt: new Date(workDateObj.getTime() + 86400000) } },
  ],
});

    if (existingContract) {
      return res.status(400).json({
        message: "🚫 Vehicle already assigned for another contract on this date.",
      });
    }

const newContract = new Contract({
  clientId,
  vehicleId,
  problem,
  contractAmount,
  durationDays,
  durationHours,
  location,
  workDate: workDateObj,
  endDate: req.body.endDate ? new Date(req.body.endDate) : workDateObj,
  status: "Active",
});



    await newContract.save();

    // ✅ Update vehicle status to "Working"
    await Vehicle.findByIdAndUpdate(vehicleId, { status: "Working" });

    // ✅ Re-populate before sending to frontend
    const populated = await Contract.findById(newContract._id)
      .populate("clientId", "name email phone city")
      .populate("vehicleId", "name registrationNumber status");

    res.status(201).json({ message: "Contract saved successfully!", contract: populated });
  } catch (err) {
    console.error("❌ Error saving contract:", err);
    res.status(500).json({ message: "Failed to save contract", error: err.message });
  }
});

/* ---------------------------------------------------------
 ✅ GET — Fetch all contracts (with population)
--------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {const contracts = await Contract.find()
  .populate("clientId", "name email phone city")
  .populate("vehicleId", "name registrationNumber status")
  .sort({ createdAt: -1 });

    res.status(200).json({ contracts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch contracts", error: err.message });
  }
});

/* ---------------------------------------------------------
 ✅ PUT — Update or mark complete
--------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const { status, vehicleId } = req.body;
const updated = await Contract.findByIdAndUpdate(
  req.params.id,
  {
    ...req.body,
    endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
  },
  { new: true }
);


    // ✅ Free vehicle when contract completed
    if (status === "Completed" && vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, { status: "Free" });
    }

    const populated = await Contract.findById(updated._id)
      .populate("clientId", "name email phone city")
      .populate("vehicleId", "name registrationNumber status");

    res.status(200).json({ message: "Contract updated successfully", contract: populated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update contract", error: err.message });
  }
});

/* ---------------------------------------------------------
 ✅ GET — Get unavailable vehicles for a date
--------------------------------------------------------- */
router.get("/unavailable/:date", async (req, res) => {
  try {
    const startOfDay = new Date(req.params.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const activeContracts = await Contract.find({
      workDate: { $gte: startOfDay, $lt: endOfDay },
      status: "Active",
    });

    const bookedVehicleIds = activeContracts.map((c) => c.vehicleId.toString());
    res.status(200).json({ bookedVehicleIds });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unavailable vehicles", error: err.message });
  }
});

export default router;
