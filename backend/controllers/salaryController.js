import sample from './sampleData.js'
import Salary from '../models/Salary.js'

export const getSalary = async (req, res) => {
	try {
		const salaries = await Salary.find()
		if (!salaries || salaries.length === 0) return res.json({ items: sample.salaryList })
		res.json({ items: salaries })
	} catch (error) {
		console.error('Get salary error:', error.message)
		res.json({ items: sample.salaryList })
	}
}
