// Minimal sample data — valid ESM module
const sampleData = {
  dashboardSample: {
    welcomeUser: '0405ironman',
    fleetCount: { active: 38, total: 45 },
    driversCount: { available: 14, total: 52 },
    maintenanceAlerts: 7,
    vehicles: [
      { id: 'MH-001-TX', label: 'MH-001-TX', status: 'enroute' },
      { id: 'KA-003-TX', label: 'KA-003-TX', status: 'loading' }
    ]
  },
  vehiclesList: [
    { id: 'MH-01-AB-1234', model: 'Tata Prima 4940.S', status: 'Active' },
    { id: 'DL-01-CD-5678', model: 'Ashok Leyland 3118', status: 'Maintenance' }
  ],
  driversList: [
    { id: 'DL-MH-2020001', name: 'Rajesh Kumar', role: 'Senior Driver' },
    { id: 'DL-GJ-20180002', name: 'Suresh Patel', role: 'Lead Driver' }
  ],
  maintenanceList: [],
  salaryList: [],
  clientsList: [
    { id: 'C-001', name: 'Acme Logistics', company: 'Acme Logistics Pvt Ltd', contactName: 'R. Sharma' }
  ]
}

export default sampleData
