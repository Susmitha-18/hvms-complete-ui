import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Assignment from "../models/Assignment.js";
import Salary from "../models/Salary.js";
import jwt from "jsonwebtoken";
import LoginLog from "../models/LoginLog.js";

import mongoose from "mongoose";

const SECRET = process.env.WORKER_SECRET || "hvmsworkersecret";

// ✅ Login (JWT)
export const loginWorker = async (req, res) => {
  const { username, password } = req.body;

  try {
    // If DB connection is active, query User collection
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ username });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "1d" });
          try {
            await LoginLog.create({
              userId: user._id,
              username: user.username,
              role: user.role,
              ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
              userAgent: req.get("User-Agent") || "unknown",
            });
          } catch (err) {}
          return res.json({
            success: true,
            token,
            user: { username: user.username, role: user.role },
          });
        }
      }
    }

    // Default fallback accounts for development / offline testing
    const defaultAccounts = {
      admin: { password: "admin123", role: "admin" },
      worker1: { password: "worker123", role: "worker" },
      worker2: { password: "worker123", role: "worker" },
    };

    if (defaultAccounts[username] && defaultAccounts[username].password === password) {
      const role = defaultAccounts[username].role;
      const token = jwt.sign({ id: username, role }, SECRET, { expiresIn: "1d" });
      return res.json({
        success: true,
        token,
        user: { username, role },
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error('❌ loginWorker unexpected error:', error && error.stack ? error.stack : error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Worker Home
export const getAssignments = async (req, res) => {
  const assignments = await Assignment.find().populate("vehicleId");
  res.json(assignments);
};

// ✅ Salary
export const getSalary = async (req, res) => {
  const salaries = await Salary.find();
  res.json(salaries);
};
