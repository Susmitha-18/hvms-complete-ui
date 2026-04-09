import User from '../models/User.js'
import Driver from '../models/Driver.js'

export const getDrivers = async (req, res) => {
    try {
        // Get all drivers from the Driver model
        const drivers = await Driver.find().sort({ createdAt: -1 });
        
        if (!drivers || drivers.length === 0) {
            return res.status(404).json({ message: 'No drivers found' });
        }
        
        res.json({ drivers });
    } catch (error) {
        console.error('Get drivers error:', error.message);
        res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
    }
}
