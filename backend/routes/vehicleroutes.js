import express from "express";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import DriverAssignmentHistory from "../models/DriverAssignmentHistory.js";

const router = express.Router();

// ✅ GET all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.status(200).json({ vehicles });
  } catch (err) {
    console.error("❌ Error fetching vehicles:", err);
    res.status(500).json({
      message: "Failed to fetch vehicles",
      error: err.message,
    });
  }
});

// ✅ POST: Add new vehicle
router.post("/", async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle: newVehicle,
    });
  } catch (err) {
    console.error("❌ Error adding vehicle:", err);
    res.status(500).json({
      message: "Failed to add vehicle",
      error: err.message,
    });
  }
});

// ✅ PUT: Unassign Vehicle from Driver (with history update)
router.put("/unassign/:id", async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { assignedVehicle: "", status: "Available" },
      { new: true }
    );
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (vehicleId) await Vehicle.findByIdAndUpdate(vehicleId, { status: "Free" });

    await DriverAssignmentHistory.findOneAndUpdate(
      { driverId: req.params.id, vehicleId, status: "Active" },
      { unassignedAt: new Date(), status: "Completed" }
    );

    res.status(200).json({ message: "Driver unassigned successfully", driver });
  } catch (err) {
    console.error("❌ Error unassigning driver:", err);
    res.status(500).json({ message: "Failed to unassign driver", error: err.message });
  }
});



// ✅ GET: All assignment history (for admin page)
router.get("/history", async (req, res) => {
  try {
    const history = await DriverAssignmentHistory.find()
      .populate("vehicleId", "vehicleId name")
      .populate("driverId", "name")
      .sort({ assignedAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    console.error("❌ Error fetching vehicle history:", err);
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
});

// ✅ GET: Specific vehicle history
router.get("/history/:vehicleId", async (req, res) => {
  try {
    const history = await DriverAssignmentHistory.find({
      vehicleId: req.params.vehicleId,
    })
      .populate("driverId", "name")
      .sort({ assignedAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch vehicle history",
      error: err.message,
    });
  }
});
// ✅ GET single vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ vehicle });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vehicle", error: err.message });
  }
});
// ✅ PUT: Update a history record (edit + save client details)
router.put("/history/update/:id", async (req, res) => {
  try {
    const updated = await DriverAssignmentHistory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ message: "History updated successfully", updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update history", error: err.message });
  }
});
// ✅ NEW ENDPOINT: Get all vehicles with their latest client address
router.get("/latest-locations", async (req, res) => {
  try {
    // 1️⃣ Get all vehicles
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    // 2️⃣ For each vehicle, find the latest assignment history
    const data = await Promise.all(
      vehicles.map(async (v) => {
        // populate vehicle info from the latest assignment history if available
        const latestHistory = await DriverAssignmentHistory.findOne({ vehicleId: v._id })
          .sort({ assignedAt: -1 })
          .populate("vehicleId", "name registrationNumber")
          .lean();

        const vehicleFromHistory = latestHistory?.vehicleId || null;

        return {
          id: v._id,
          vehicleId: vehicleFromHistory?._id || v._id,
          vehicleName: vehicleFromHistory?.name || v.name,
          registrationNumber: vehicleFromHistory?.registrationNumber || v.registrationNumber || "",
          model: v.vehicleModel,
          address: latestHistory?.clientAddress || v.address || null,
          status: v.status,
          latestAssignment: latestHistory || null,
        };
      })
    );

    res.status(200).json({ vehicles: data });
  } catch (err) {
    console.error("❌ Error fetching latest vehicle locations:", err);
    res.status(500).json({
      message: "Failed to fetch latest vehicle locations",
      error: err.message, 
    });
  }
});

export default router;
