import sample from './sampleData.js'

// If you later add a Maintenance model, import and use it here.
export const getMaintenance = async (req, res) => {
	try {
		// No DB model exists yet for maintenance; return sample data
		return res.json({ items: sample.maintenanceList })
	} catch (error) {
		console.error('Get maintenance error:', error.message)
		res.json({ items: sample.maintenanceList })
	}
}
