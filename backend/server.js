import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import apiRouter from "./routes/api.js";
import mailRouter from "./routes/mailRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import vehicleRoutes from "./routes/vehicleroutes.js";
import healthRouter from "./routes/health.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

/* 🧠 Express setup */
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

/* Static uploads */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* 🔗 Register routes */
app.use("/api/health", healthRouter);
app.use("/api", apiRouter);
app.use("/api/mail", mailRouter);
app.use("/api/worker", workerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/attendance", attendanceRoutes);

/* 🌐 Port (IMPORTANT for Render) */
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // REQUIRED for Render deployment

/* 🚀 Start server */
async function startServer() {
  try {
    await connectDB({ maxAttempts: 5, initialDelayMs: 1000 });

    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ MongoDB connected successfully`);
      console.log(`🚀 Backend running on http://${HOST}:${PORT}`);
      console.log("🌍 CORS enabled, ready for frontend requests");
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use.`);
      } else {
        console.error("❌ Server error:", err.message || err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();
