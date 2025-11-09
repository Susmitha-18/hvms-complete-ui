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

// Get all vehicles with their latest client address
router.get("/latest-locations", async (req, res) => {
  try {
    // Get active vehicles with minimal fields
    const vehicles = await Vehicle.find({}, {
      _id: 1,
      name: 1,
      registrationNumber: 1,
      vehicleModel: 1,
      status: 1
    }).lean();

    console.log(`📦 Found ${vehicles.length} vehicles`);

    // Static test addresses
    const testAddresses = ['682001', '641001', '560001', '600001', '695001'];
    
    // Process each vehicle serially (avoid overwhelming Nominatim)
    const data = vehicles.map(v => {
      // Use deterministic test address based on vehicle ID
      const addressIndex = Math.abs(
        parseInt(v._id.toString().substring(0, 8), 16)
      ) % testAddresses.length;
      
      return {
        id: v._id,
        vehicleId: v._id,
        vehicleName: v.name || 'Unnamed Vehicle',
        registrationNumber: v.registrationNumber || 'No Reg',
        model: v.vehicleModel || 'Unknown Model',
        address: testAddresses[addressIndex],
        status: v.status || 'Unknown'
      };
    });

    console.log(`✨ Returning ${data.length} vehicle locations`);
    res.status(200).json({ vehicles: data });
  } catch (err) {
    console.error("❌ Error in /latest-locations:", err.message);
    res.status(500).json({
      message: "Failed to fetch vehicle locations",
      error: err.message 
    });
  }
});
// ✅ GET single vehicle by ID

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

// ✅ NEW ENDPOINT: Get all vehicles with their latest client address
// Placed BEFORE the `/:id` route so it doesn't get captured as an `id` param
router.get("/latest-locations", async (req, res) => {
  try {
    console.log('🚀 Fetching latest vehicle locations...');
    
    // 1️⃣ Get all vehicles
    const vehicles = await Vehicle.find().select('_id name registrationNumber vehicleModel status').lean();
    console.log(`📦 Found ${vehicles.length} total vehicles`);

    // 2️⃣ For each vehicle, find the latest assignment history
    const data = await Promise.all(
      vehicles.map(async (v) => {
        try {
          // Get latest assignment with client address for this vehicle
          const latestHistory = await DriverAssignmentHistory.findOne({ vehicleId: v._id })
            .sort({ assignedAt: -1 })
            .select('clientAddress assignedAt')
            .lean();

          // Use a demo address if no valid address is found (for testing)
          const demoAddresses = [
            '682001', // Ernakulam
            '641001', // Coimbatore
            '560001', // Bangalore
            '600001', // Chennai
            '695001', // Thiruvananthapuram
          ];

          // Use either real address or demo address
          const finalAddress = 
            (latestHistory && latestHistory.clientAddress?.trim()) || 
            demoAddresses[Math.floor(Math.abs(parseInt(v._id.substring(0, 8), 16)) % demoAddresses.length)];

          const result = {
            id: v._id,
            vehicleId: v._id,
            vehicleName: v.name || 'Unnamed Vehicle',
            registrationNumber: v.registrationNumber || 'No Reg',
            model: v.vehicleModel,
            address: finalAddress,
            status: v.status
          };
          console.log(`✅ Processed vehicle ${v._id} with address ${finalAddress}`);
          return result;
        } catch (err) {
          console.error(`❌ Error processing vehicle ${v._id}:`, err);
          return null;
        }
      })
    );

    // Filter out null entries and send response
    const validData = data.filter(Boolean);
    console.log(`✨ Returning ${validData.length} vehicles with valid data`);
    
    res.status(200).json({ vehicles: validData });
  } catch (err) {
    console.error("❌ Error in /latest-locations:", err);
    res.status(500).json({
      message: "Failed to fetch latest vehicle locations",
      error: err.message
    });
  }

        const vehicleFromHistory = latestHistory?.vehicleId || null;

          const clientAddress = latestHistory?.clientAddress?.trim();
          
            // Use a demo address if no valid address is found (for testing)
          const demoAddresses = [
            '682001, Kerala', // Ernakulam
            '641001, Tamil Nadu', // Coimbatore
            '560001, Karnataka', // Bangalore
            '600001, Tamil Nadu', // Chennai
            '695001, Kerala', // Thiruvananthapuram
          ];
          
          // Use either the real address or a demo address based on vehicle ID
          const finalAddress = clientAddress || demoAddresses[Math.floor(Math.abs(parseInt(v._id.substring(0, 8), 16)) % demoAddresses.length)];

          return {
            id: v._id,
            vehicleId: vehicleFromHistory?._id || v._id,
            vehicleName: vehicleFromHistory?.name || v.name,
            registrationNumber: vehicleFromHistory?.registrationNumber || v.registrationNumber || "",
            model: v.vehicleModel,
            address: finalAddress,
            status: v.status,
            latestAssignment: latestHistory || null,
          };
      })
    );

    // Filter out null entries (vehicles without addresses)
    const validData = data.filter(Boolean);
    console.log(`ℹ️ Found ${validData.length} vehicles with valid addresses out of ${vehicles.length} total`);

    res.status(200).json({ vehicles: validData });
  } catch (err) {
    console.error("❌ Error fetching latest vehicle locations:", err);
    res.status(500).json({
      message: "Failed to fetch latest vehicle locations",
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
    console.log('📥 Update history request:', req.params.id, req.body);
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


export default router;
