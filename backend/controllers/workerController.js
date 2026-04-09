import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Assignment from "../models/Assignment.js";
import Salary from "../models/Salary.js";
import jwt from "jsonwebtoken";
import LoginLog from "../models/LoginLog.js";

const SECRET = process.env.WORKER_SECRET || "hvmsworkersecret";

// ✅ Login (JWT)
export const loginWorker = async (req, res) => {
  const { username, password } = req.body;

  try {
    // allow any user (worker or admin) to authenticate here; frontend will
    // redirect based on returned `user.role` so keep that behavior intact
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 🪄 Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "1d" });

    // ✅ Save login log to database
    try {
      await LoginLog.create({
        userId: user._id,
        username: user.username,
        role: user.role,
        ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
      });
      console.log(`✅ Login logged for ${user.username}`);
    } catch (err) {
      console.error("❌ Error saving login log:", err.message);
    }

    // ✅ Respond to frontend
    res.json({
      success: true,
      token,
      user: { username: user.username, role: user.role },
    });
  } catch (error) {
    // Log full stack server-side for diagnostics, but avoid leaking internals to client
    console.error('❌ loginWorker unexpected error:', error && error.stack ? error.stack : error)
    res.status(500).json({ message: 'Internal server error' });
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
