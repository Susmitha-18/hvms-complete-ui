import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const run = async () => {
  try {
    await connectDB()
    const res = await User.updateMany({ role: 'driver' }, { $set: { role: 'worker' } })
    console.log('Updated', res.modifiedCount || res.nModified || res.modified || 0, 'user(s)')
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
