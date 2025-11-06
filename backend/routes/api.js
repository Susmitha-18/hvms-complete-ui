import express from 'express'
import { getDashboard } from '../controllers/dashboardController.js'
import { getVehicles } from '../controllers/vehiclesController.js'
import { getDrivers } from '../controllers/driversController.js'
import { getMaintenance } from '../controllers/maintenanceController.js'

const router = express.Router()

router.get('/dashboard', getDashboard)
router.get('/vehicles', getVehicles)
router.get('/driver-stats', getDrivers)

router.get('/maintenance', getMaintenance)

export default router
