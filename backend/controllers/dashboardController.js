import sample from './sampleData.js'
import Vehicle from '../models/Vehicle.js'

export const getDashboard = async (req, res) => {
	try {
		const vehicleCount = await Vehicle.countDocuments()
		const vehicles = await Vehicle.find().limit(5)
		// Build a minimal dashboard object; if DB is empty, fall back to sample
		if (vehicleCount === 0) return res.json(sample.dashboardSample)

		const dashboard = {
			welcomeUser: 'HVMS User',
			fleetCount: { active: vehicleCount, total: vehicleCount },
			driversCount: { available: 0, total: 0 },
			maintenanceAlerts: 0,
			vehicles: vehicles.map(v => ({ id: v.registrationNumber || v._id, label: v.name || v._id, status: v.status }))
		}

		res.json(dashboard)
	} catch (error) {
		console.error('Dashboard fetch error:', error.message)
		res.json(sample.dashboardSample)
	}
}
