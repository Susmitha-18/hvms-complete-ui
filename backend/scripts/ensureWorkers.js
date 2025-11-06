import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const ensure = async () => {
  try {
    await connectDB()
    const existing = await User.find({ role: 'worker' })
    if (existing.length === 0) {
      const users = [
        { username: 'worker1', password: 'worker123', role: 'worker' },
        { username: 'worker2', password: 'worker123', role: 'worker' }
      ]
      for (const u of users) {
        await User.create(u)
      }
      console.log('Inserted worker users')
    } else {
      console.log('Worker users already exist')
    }
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

ensure()
