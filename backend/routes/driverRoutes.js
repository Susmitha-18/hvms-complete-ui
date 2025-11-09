import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import DriverAssignmentHistory from "../models/DriverAssignmentHistory.js";

const router = express.Router();

/* ===========================
   🗂️ MULTER File Upload Setup
=========================== */

// Ensure upload directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`
    ),
});

// File upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only JPG, PNG, and PDF files are allowed"));
    }
    cb(null, true);
  },
});

/* ===========================
   ✅ GET all drivers
=========================== */
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.status(200).json({ drivers });
  } catch (err) {
    console.error("❌ Error fetching drivers:", err);
    res.status(500).json({
      message: "Failed to fetch drivers",
      error: err.message,
    });
  }
});

/* ===========================
   ✅ GET driver by ID
=========================== */
router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.status(200).json({ driver });
  } catch (err) {
    console.error("❌ Error fetching driver:", err);
    res.status(500).json({
      message: "Failed to fetch driver details",
      error: err.message,
    });
  }
});

/* ===========================
   ✅ POST: Add new driver (with file uploads)
=========================== */

/* ===========================
   ✅ POST: Add new driver (with file uploads)
=========================== */
router.post(
  "/",
  upload.fields([
    { name: "aadhaarFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 🧠 Log incoming data for debugging
      console.log("📥 Incoming driver data:", req.body);

      const files = req.files || {};

      // ✅ Ensure proper data type conversion
      const driverData = {
        ...req.body,
        age: Number(req.body.age) || 0,
        experience: Number(req.body.experience) || 0,
        aadhaarFile: files.aadhaarFile?.[0]?.filename || "",
        licenseFile: files.licenseFile?.[0]?.filename || "",
        photoFile: files.photoFile?.[0]?.filename || "",
      };

      // 🧾 Log file details for confirmation
      console.log("📂 Uploaded files:", driverData);

      // ✅ Create and save new driver
      const newDriver = new Driver(driverData);
      await newDriver.save();

      res.status(201).json({
        message: "✅ Driver added successfully",
        driver: newDriver,
      });
    } catch (err) {
      console.error("❌ Error adding driver:", err);
      res.status(500).json({
        message: "Failed to add driver",
        error: err.message,
      });
    }
  }
);

/* ===========================
   ✅ PUT: Edit driver (update info or reupload files)
=========================== */
router.put(
  "/edit/:id",
  upload.fields([
    { name: "aadhaarFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};
      const updates = { ...req.body };

      // Update files if new ones are uploaded
      if (files.aadhaarFile) updates.aadhaarFile = files.aadhaarFile[0].filename;
      if (files.licenseFile) updates.licenseFile = files.licenseFile[0].filename;
      if (files.photoFile) updates.photoFile = files.photoFile[0].filename;

      const driver = await Driver.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });

      if (!driver)
        return res.status(404).json({ message: "Driver not found" });

      res.status(200).json({
        message: "✅ Driver updated successfully",
        driver,
      });
    } catch (err) {
      console.error("❌ Error updating driver:", err);
      res.status(500).json({
        message: "Failed to update driver",
        error: err.message,
      });
    }
  }
);

/* ===========================
   ✅ PUT: Assign vehicle
=========================== */
router.put("/assign/:id", async (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId)
      return res.status(400).json({ message: "Vehicle ID is required" });

    const driver = await Driver.findById(req.params.id);
    if (!driver)
      return res.status(404).json({ message: "Driver not found" });

    // ✅ If driver already had an assigned vehicle, close that history first
    if (driver.assignedVehicle) {
      await DriverAssignmentHistory.findOneAndUpdate(
        { driverId: driver._id, status: "Active" },
        { status: "Completed", unassignedAt: new Date() }
      );
    }

    // ✅ Assign new vehicle
    driver.assignedVehicle = vehicleId;
    driver.status = "Assigned";
    await driver.save();

    await Vehicle.findByIdAndUpdate(vehicleId, { status: "Working" });

    // ✅ Create new assignment history record
    await DriverAssignmentHistory.create({
      driverId: driver._id,
      vehicleId: vehicleId,
      assignedAt: new Date(),
      status: "Active",
    });

    res.status(200).json({
      message: "✅ Vehicle assigned successfully",
      driver,
    });
  } catch (err) {
    console.error("❌ Error assigning vehicle:", err);
    res.status(500).json({
      message: "Failed to assign vehicle",
      error: err.message,
    });
  }
});



/* ===========================
   ✅ PUT: Unassign vehicle
=========================== */
router.put("/unassign/:id", async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver)
      return res.status(404).json({ message: "Driver not found" });

    // ✅ Update history before clearing driver’s assigned vehicle
    // Try to close the active history record for this driver+vehicle.
    // In some older records `vehicleId` may be stored differently (string vs ObjectId)
    // so attempt a best-effort update. If the specific record isn't found,
    // fall back to closing the latest active record for the driver.
    let updated = await DriverAssignmentHistory.findOneAndUpdate(
      { driverId: driver._id, vehicleId, status: "Active" },
      { status: "Completed", unassignedAt: new Date() }
    );

    if (!updated) {
      console.info("[driverRoutes] Exact history record not found, falling back to latest active record for driver", driver._id);
      updated = await DriverAssignmentHistory.findOneAndUpdate(
        { driverId: driver._id, status: "Active" },
        { status: "Completed", unassignedAt: new Date() }
      );
    }

    // ✅ Reset driver’s status
    driver.assignedVehicle = "";
    driver.status = "Available";
    await driver.save();

    if (vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, { status: "Free" });
    }

    res.status(200).json({
      message: "✅ Driver unassigned successfully",
      driver,
    });
  } catch (err) {
    console.error("❌ Error unassigning vehicle:", err);
    res.status(500).json({
      message: "Failed to unassign driver",
      error: err.message,
    });
  }
});


export default router;
// ✅ Get all assignment history for a driver
router.get("/history/:driverId", async (req, res) => {
  try {
    const history = await DriverAssignmentHistory.find({
      driverId: req.params.driverId,
    })
      .populate("vehicleId", "vehicleId name vehicleModel vehicleType")
      .sort({ assignedAt: -1 });

    res.status(200).json({ history });
  } catch (err) {
    console.error("❌ Error fetching assignment history:", err);
    res.status(500).json({
      message: "Failed to fetch history",
      error: err.message,
    });
  }
});
