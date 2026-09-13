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

/* 🧹 Step 1: Automatically free up ports on Windows dev environment if needed */
if (process.platform === "win32") {
  try {
    execSync(
      `netstat -ano | findstr :5001 | find "LISTENING" && for /f "tokens=5" %a in ('netstat -ano ^| findstr :5001 ^| find "LISTENING"') do taskkill /F /PID %a`,
      { stdio: "ignore" }
    );
    console.log("🧹 Cleared port 5001 before starting...");
  } catch {}

  try {
    execSync(
      `netstat -ano | findstr :80 | find "LISTENING" && for /f "tokens=5" %a in ('netstat -ano ^| findstr :80 ^| find "LISTENING"') do taskkill /F /PID %a`,
      { stdio: "ignore" }
    );
    console.log("🧹 Cleared port 80 before starting...");
  } catch {}
}

/* 🧠 Express setup */
const app = express();
// Configure CORS explicitly so the frontend (deployed on a different origin)
// can interact with the API. We allow the requesting origin and enable
// credentials in case some endpoints later rely on cookies. This is safe for
// early-stage apps; for production you can restrict `origin` to the exact
// frontend host (e.g. https://your-frontend.onrender.com).
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin like curl/postman
    if (!origin) return callback(null, true);
    // Accept the origin; for stricter security replace this with a whitelist
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
  const HOST = process.env.HOST || '0.0.0.0';
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Backend running and listening on http://${HOST}:${PORT}`);
    console.log("🌍 CORS enabled, ready for frontend requests");
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
    } else {
      console.error('❌ Server error:', err && err.message ? err.message : err);
    }
    process.exit(1);
  });

  // Connect to DB asynchronously so server is immediately responsive to health checks
  connectDB({ maxAttempts: 2, initialDelayMs: 500 }).catch((err) => {
    console.warn("⚠️ MongoDB connection notice:", err.message);
  });
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
