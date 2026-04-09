import express from 'express'
import mongoose from 'mongoose'

const router = express.Router()

// Simple health check: reports server up + DB connection state
router.get('/', async (req, res) => {
  const dbState = mongoose.connection.readyState // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }

  res.json({
    ok: true,
    serverTime: new Date().toISOString(),
    db: { state: states[dbState] || String(dbState) }
  })
})

export default router
