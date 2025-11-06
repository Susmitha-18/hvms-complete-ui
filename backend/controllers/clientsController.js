import sample from './sampleData.js'
import Client from '../models/Client.js'

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find()
    if (!clients || clients.length === 0) return res.json({ clients: sample.clientsList || [] })
    res.json({ clients })
  } catch (error) {
    console.error('Get clients error:', error.message)
    res.json({ clients: sample.clientsList || [] })
  }
}
