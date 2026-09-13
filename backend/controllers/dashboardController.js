import sample from './sampleData.js'
import Vehicle from '../models/Vehicle.js'
import Driver from '../models/Driver.js'

export const getDashboard = async (req, res) => {
	try {
		const dbVehicles = await Vehicle.find()
		const dbDrivers = await Driver.find()

		const vehiclesList = dbVehicles.length > 0 ? dbVehicles : sample.vehiclesList || []
		const driversList = dbDrivers.length > 0 ? dbDrivers : sample.driversList || []

		const activeVehicles = vehiclesList.filter(v => 
			(v.status || '').toLowerCase().includes('active') || (v.status || '').toLowerCase() === 'working'
		).length

		const availableDrivers = driversList.filter(d => 
			(d.status || '').toLowerCase() === 'available'
		).length

		const maintenanceCount = vehiclesList.filter(v => 
			(v.status || '').toLowerCase().includes('maint') || (v.status || '').toLowerCase().includes('service')
		).length

		const dashboard = {
			welcomeUser: 'HVMS Admin',
			fleetCount: { active: activeVehicles, total: vehiclesList.length },
			driversCount: { available: availableDrivers, total: driversList.length },
			maintenanceAlerts: maintenanceCount || sample.dashboardSample.maintenanceAlerts || 7,
			vehicles: vehiclesList.slice(0, 5).map(v => ({
				id: v.registrationNumber || v.id || v._id,
				label: v.name || v.model || v.id,
				status: v.status || 'Active'
			}))
		}

		res.json(dashboard)
	} catch (error) {
		console.error('Dashboard fetch error:', error.message)
		res.json(sample.dashboardSample)
	}
}
