import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { execSync } from "child_process";
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

/* 🧹 Step 1: Automatically free up port 5001 before starting */
try {
  execSync(
    `netstat -ano | findstr :5001 | find "LISTENING" && for /f "tokens=5" %a in ('netstat -ano ^| findstr :5001 ^| find "LISTENING"') do taskkill /F /PID %a`,
    { stdio: "ignore" }
  );
  console.log("🧹 Cleared port 5001 before starting...");
} catch {}

/* 🧹 Step 1: Automatically free up port 80 before starting */
try {
  execSync(
    `netstat -ano | findstr :80 | find "LISTENING" && for /f "tokens=5" %a in ('netstat -ano ^| findstr :80 ^| find "LISTENING"') do taskkill /F /PID %a`,
    { stdio: "ignore" }
  );
  console.log("🧹 Cleared port 80 before starting...");
} catch {}

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

/* 🌐 Port */
const PORT = process.env.PORT || 5000;

/* 🚀 Start server */
async function startServer() {
  try {
    await connectDB({ maxAttempts: 5, initialDelayMs: 1000 });
      // Bind address: default to 0.0.0.0 so cloud hosts (Render) can detect the
      // listening port. You can override with the HOST env var if needed.
        const HOST = process.env.HOST || '0.0.0.0';
      const server = app.listen(PORT, HOST, () => {
        console.log("✅ MongoDB connected successfully");
        console.log(`🚀 Backend running and listening on ${HOST}:${PORT}`);
        console.log("🌍 CORS enabled, ready for frontend requests");
      });

      // Better error message for common listen errors (like EADDRINUSE)
      server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use. Kill the process using that port or set a different PORT environment variable.`);
        } else {
          console.error('❌ Server error:', err && err.message ? err.message : err);
        }
        process.exit(1);
      });
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();

/* Nginx configuration (uncomment if using Nginx reverse proxy)
server {
    listen 80;
    server_name example.com; # replace with your domain or _ for default

    root /var/www/hvms-frontend/dist; # path to frontend build on the server
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
*/
