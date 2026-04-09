import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import sampleData from '../controllers/sampleData.js'
import User from '../models/User.js'
import Vehicle from '../models/Vehicle.js'
import Client from '../models/Client.js'
import Salary from '../models/Salary.js'
import Assignment from '../models/Assignment.js'

dotenv.config()

const seed = async () => {
  try {
    await connectDB()

    // Users (create workers/admin if not exists)
    const usersCount = await User.countDocuments()
    if (usersCount === 0) {
      const users = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'worker1', password: 'worker123', role: 'worker' },
        { username: 'worker2', password: 'worker123', role: 'worker' }
      ]
      // Use create() so model pre-save hooks run (hashing)
      for (const u of users) {
        await User.create(u)
      }
      console.log('Seeded users')
    } else {
      console.log('Users collection already has data — skipping users seeding')
    }

    // Vehicles
    const vehiclesCount = await Vehicle.countDocuments()
    if (vehiclesCount === 0) {
      const mapStatus = s => {
        if (!s) return 'Free'
        const low = String(s).toLowerCase()
        if (low.includes('active') || low.includes('enroute') || low.includes('loading')) return 'Working'
        if (low.includes('maintenance') || low.includes('out-of-service') || low.includes('out of service')) return 'In Service'
        if (low.includes('idle') || low.includes('free')) return 'Free'
        return 'Free'
      }
      const vehicles = sampleData.vehiclesList.map(v => ({ name: v.model || v.id, registrationNumber: v.id, status: mapStatus(v.status) }))
      await Vehicle.insertMany(vehicles)
      console.log('Seeded vehicles')
    } else {
      console.log('Vehicles collection already has data — skipping vehicles seeding')
    }

    // Clients
    const clientsCount = await Client.countDocuments()
    if (clientsCount === 0) {
      const clients = sampleData.clientsList.map(c => ({ name: c.name, location: c.region || '', contact: c.contactName || '' }))
      await Client.insertMany(clients)
      console.log('Seeded clients')
    } else {
      console.log('Clients collection already has data — skipping clients seeding')
    }

    // Salaries
    const salaryCount = await Salary.countDocuments()
    if (salaryCount === 0) {
      const salaries = sampleData.salaryList.map(s => ({ workerId: null, month: s.month, amount: s.base || 0, allowances: s.overtime || 0, deductions: 0 }))
      await Salary.insertMany(salaries)
      console.log('Seeded salaries')
    } else {
      console.log('Salary collection already has data — skipping salaries seeding')
    }

    // Assignments - optional; create none by default
    console.log('Seeding complete')
    process.exit(0)
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seed()
