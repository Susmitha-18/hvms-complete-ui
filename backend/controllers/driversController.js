import User from '../models/User.js'
import Driver from '../models/Driver.js'
import sample from './sampleData.js'

export const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        if (!drivers || drivers.length === 0) {
            return res.json({ drivers: sample.driversList || [] });
        }
        res.json({ drivers });
    } catch (error) {
        console.error('Get drivers error:', error.message);
        res.json({ drivers: sample.driversList || [] });
    }
}
