import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

// ✅ Add a new client
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, address, city, state, industry, status, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Client name is required" });
    }

    const newClient = new Client({
      name,
      phone,
      email,
      address,
      city,
      state,
      industry,
      status,
      notes,
    });

    await newClient.save();
    res.status(201).json({ message: "Client added successfully!", client: newClient });
  } catch (err) {
    console.error("❌ Error adding client:", err);
    res.status(500).json({ message: "Failed to save client", error: err.message });
  }
});

// ✅ Get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({ clients });
  } catch (err) {
    console.error("❌ Error fetching clients:", err);
    res.status(500).json({ message: "Failed to fetch clients", error: err.message });
  }
});

export default router;
