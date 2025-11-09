import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // ✅ Auto-generated ID like VEH001
    vehicleId: { type: String, unique: true },

    // ✅ Basic fields
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true },

    // ✅ Extended vehicle info
    vehicleModel: String,
    vehicleType: {
      type: String,
      enum: ["Heavy Truck", "Mini Truck", "Trailer", "Car", "Van", "Bus"],
    },
    manufacturingYear: String,
    vinNumber: String,
    engineType: String,
    loadCapacity: String,
    fuelType: {
      type: String,
      enum: ["Diesel", "Petrol", "CNG", "Electric", "Hybrid"],
    },
    additionalNotes: String,

    // ✅ Dates and pricing
    registrationExpiry: String,
    insuranceExpiry: String,
    purchaseDate: String,
    purchasePrice: String,

    // ✅ Status
    status: {
      type: String,
      enum: ["Working", "Free", "In Service"],
      default: "Free",
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate Vehicle ID like VEH001, VEH002, ...
vehicleSchema.pre("save", async function (next) {
  if (this.vehicleId) return next(); // skip if already set

  const lastVehicle = await mongoose
    .model("Vehicle")
    .findOne()
    .sort({ createdAt: -1 });

  let newId = "VEH001";
  if (lastVehicle && lastVehicle.vehicleId) {
    const lastNum = parseInt(lastVehicle.vehicleId.replace("VEH", ""), 10);
    newId = "VEH" + String(lastNum + 1).padStart(3, "0");
  }

  this.vehicleId = newId;
  next();
});

export default mongoose.model("Vehicle", vehicleSchema);
