import sample from './sampleData.js'
import Vehicle from '../models/Vehicle.js'

export const getVehicles = async (req, res) => {
	try {
		const vehicles = await Vehicle.find()
		if (!vehicles || vehicles.length === 0) return res.json({ vehicles: sample.vehiclesList })
		res.json({ vehicles })
	} catch (error) {
		console.error('Get vehicles error:', error.message)
		res.json({ vehicles: sample.vehiclesList })
	}
}
