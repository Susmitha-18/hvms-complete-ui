import mongoose from 'mongoose'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Connect to MongoDB with retry/backoff. This avoids the process exiting on
 * transient DB failures and reduces nodemon churn when connection hiccups occur.
 *
 * It will attempt `maxAttempts` (default 5) with exponential backoff before
 * throwing the last error.
 */
const connectDB = async ({ maxAttempts = 5, initialDelayMs = 1000 } = {}) => {
  const uri = process.env.MONGO_URI || "mongodb://HMVSadmin:Susmi%40_123@localhost:27017/HMVS?authSource=admin"
  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(uri)
      console.log('✅ MongoDB connected successfully')
      return
    } catch (error) {
      attempt += 1
      const msg = error && error.message ? error.message : String(error)
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${msg}`)
      if (attempt >= maxAttempts) {
        console.error('❌ All MongoDB connection attempts failed')
        throw error
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
