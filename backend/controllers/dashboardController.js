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
			vehicles: await Promise.all(vehicles.map(async v => {
				// Get latest assignment history for address
				const DriverAssignmentHistory = (await import('../models/DriverAssignmentHistory.js')).default;
				const latest = await DriverAssignmentHistory.findOne({ vehicleId: v._id })
					.sort({ assignedAt: -1 })
					.lean();

				return {
					id: v.registrationNumber || v._id,
					label: v.name || v._id,
					status: v.status,
					vehicleName: v.name,
					registrationNumber: v.registrationNumber,
					address: latest?.clientAddress || '682001' // Fallback to Ernakulam pincode if no address
				};
			}))
		}

		res.json(dashboard)
	} catch (error) {
		console.error('Dashboard fetch error:', error.message)
		res.json(sample.dashboardSample)
	}
}
