import mongoose from 'mongoose'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import User from '../models/User.js'

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Auto-seed default admin & worker credentials if DB user collection is empty
 */
const autoSeedUsersIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      console.log('🌱 Empty database detected. Auto-seeding initial users...')
      const initialUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'worker1', password: 'worker123', role: 'worker' },
        { username: 'worker2', password: 'worker123', role: 'worker' },
      ]
      for (const u of initialUsers) {
        await User.create(u)
      }
      console.log('✅ Default users seeded successfully (admin / admin123, worker1 / worker123)')
    }
  } catch (err) {
    console.error('⚠️ Auto-seeding users warning:', err && err.message ? err.message : err)
  }
}

/**
 * Connect to MongoDB with retry/backoff. This avoids the process exiting on
 * transient DB failures and reduces nodemon churn when connection hiccups occur.
 *
 * It will attempt `maxAttempts` (default 5) with exponential backoff before
 * throwing the last error.
 */
const connectDB = async ({ maxAttempts = 2, initialDelayMs = 500 } = {}) => {
  const uri = process.env.MONGO_URI || "mongodb://HMVSadmin:Susmi%40_123@localhost:27017/HMVS?authSource=admin"
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI env variable is missing! Make sure MONGO_URI is set in Render environment variables for production database access.')
  }
  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
      console.log('✅ MongoDB connected successfully')
      await autoSeedUsersIfEmpty()
      return
    } catch (error) {
      attempt += 1
      const msg = error && error.message ? error.message : String(error)
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${msg}`)
      if (attempt >= maxAttempts) {
        console.warn('⚠️ Could not connect to MongoDB. Running in offline/dev fallback mode (health check and dev logins enabled).')
        return
      }
      const wait = initialDelayMs * Math.pow(2, attempt - 1)
      console.log(`⏳ Retrying MongoDB connection in ${wait}ms...`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
}

// serve production frontend (if you build frontend into ../frontend/dist)
const app = express()
app.use(express.static(join(__dirname, "../frontend/dist")))
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../frontend/dist/index.html"))
})

export default connectDB
