import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    driverId: { type: String, unique: true },
    name: { type: String, required: true },
    age: Number,
    gender: String,
    phone: String,
    email: String,
    address: String,
    aadhaarNo: String,
    bloodGroup: String,
    emergencyContact: String,
    licenseNo: String,
    licenseExpiry: String,
    experience: String,
    status: { type: String, default: "Available" },
    assignedVehicle: { type: String, default: "" },
    rating: { type: String, default: "4.5/5.0" },
  totalPresentDays: { type: Number, default: 0 },

    // File uploads
    aadhaarFile: String,
    licenseFile: String,
    photoFile: String,
  },
  { timestamps: true }
);

// ✅ Auto-generate driverId before saving
driverSchema.pre("save", async function (next) {
  if (this.driverId) return next();

  const lastDriver = await mongoose.model("Driver").findOne().sort({ createdAt: -1 });
  let newId = "DRV001";

  if (lastDriver && lastDriver.driverId) {
    const lastNumber = parseInt(lastDriver.driverId.replace("DRV", ""), 10);
    newId = "DRV" + String(lastNumber + 1).padStart(3, "0");
  }

  this.driverId = newId;
  next();
});

export default mongoose.model("Driver", driverSchema);
