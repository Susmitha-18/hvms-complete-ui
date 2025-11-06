// frontend/src/data/sampleData.js

export const dashboardSample = {
  welcomeUser: "0405ironman",
  fleetCount: { active: 38, total: 45 },
  driversCount: { available: 14, total: 52 },
  maintenanceAlerts: 7,
  vehicles: [
    { id: "MH-001-TX", label: "MH-001-TX", status: "enroute" },
    { id: "KA-003-TX", label: "KA-003-TX", status: "loading" },
    { id: "DL-002-TX", label: "DL-002-TX", status: "delivered" },
    { id: "TN-004-TX", label: "TN-004-TX", status: "maintenance" }
  ]
}

export const vehiclesList = [
  { id: "MH-01-AB-1234", model: "Tata Prima 4940.S", type: "Heavy Truck", mileage: "125,000 mi", driver: "Rajesh Kumar", location: "Mumbai, Maharashtra", fuel: 85, status: "Active" },
  { id: "DL-01-CD-5678", model: "Ashok Leyland 3118", type: "Heavy Truck", mileage: "98,000 mi", driver: "Amit Singh", location: "Delhi, Delhi", fuel: 45, status: "Maintenance" },
  { id: "KA-03-EF-9012", model: "Mahindra Blazo X 35", type: "Heavy Truck", mileage: "87,500 mi", driver: "Vikram", location: "Bangalore, Karnataka", fuel: 92, status: "Idle" },
  { id: "TN-09-GH-3456", model: "Eicher Pro 6049", type: "Heavy Truck", mileage: "156,000 mi", driver: "Suresh Patel", location: "Chennai, Tamil Nadu", fuel: 67, status: "Active" },
  { id: "GJ-01-IJ-7890", model: "BharatBenz 2528C", type: "Heavy Truck", mileage: "203,000 mi", driver: "Kiran", location: "Ahmedabad, Gujarat", fuel: 23, status: "Out-Of-Service" }
]

// export const driversList = [
//   { id: "DL-MH-2020001", name: "Rajesh Kumar", role: "Senior Driver", phone: "+91 98765 43210", email: "rajesh.kumar@hvms.com", location: "Mumbai, Maharashtra", status: "Assigned" },
//   { id: "DL-GJ-20180002", name: "Suresh Patel", role: "Lead Driver", phone: "+91 98765 43211", email: "suresh.patel@hvms.com", location: "Chennai, Tamil Nadu", status: "Assigned" },
//   { id: "DL-DL-20210003", name: "Priya Sharma", role: "Mechanic", phone: "+91 98765 43212", email: "priya.sharma@hvms.com", location: "Delhi, Delhi", status: "Available" },
//   { id: "DL-UP-20160004", name: "Amit Singh", role: "Fleet Manager", phone: "+91 98765 43213", email: "amit.singh@hvms.com", location: "Lucknow, Uttar Pradesh", status: "Available" }
// ]

export const maintenanceList = [
  { id: "M-001", title: "Routine Service", vehicle: "HV-001-TX", date: "2024-09-15", assignedTo: "Robert Wilson", status: "Completed", priority: "Medium", cost: 850 },
  { id: "M-002", title: "Brake Repair", vehicle: "HV-002-TX", date: "2024-10-05", assignedTo: "Sarah Davis", status: "In Progress", priority: "High", cost: 1200 },
  { id: "M-003", title: "Tire Replacement", vehicle: "HV-003-TX", date: "2024-10-10", assignedTo: "", status: "Scheduled", priority: "Medium", cost: 2400 },
  { id: "M-004", title: "Engine Diagnostic", vehicle: "HV-004-TX", date: "2024-09-30", assignedTo: "", status: "Overdue", priority: "Critical", cost: 800 }
]

export const salaryList = [
  { id: "P-2024-09-RK", name: "Rajesh Kumar", month: "September 2024", base: 40000, overtime: 8500, bonuses: 5000, gross: 53500, net: 41500, status: "Paid" },
  { id: "P-2024-09-SP", name: "Suresh Patel", month: "September 2024", base: 43333, overtime: 9200, bonuses: 7500, gross: 60033, net: 46533, status: "Paid" },
  { id: "P-2024-09-PS", name: "Priya Sharma", month: "September 2024", base: 35000, overtime: 4400, bonuses: 2000, gross: 41400, net: 31600, status: "Paid" }
]

// ----------------- CLIENTS & CONTRACTS -----------------
// merged clients list (combined entries from both previous lists)
export const clientsList = [
  // earlier small entries
  {
    id: "C-001",
    name: "Acme Logistics",
    company: "Acme Logistics Pvt Ltd",
    contactName: "R. Sharma",
    phone: "+91 98765 00001",
    email: "contact@acmelogistics.com",
    region: "Mumbai, Maharashtra",
    openOrders: 4
  },
  {
    id: "C-002",
    name: "BlueFreight",
    company: "BlueFreight Transport",
    contactName: "S. Gupta",
    phone: "+91 98765 00002",
    email: "hello@bluefreight.co",
    region: "Delhi, Delhi",
    openOrders: 1
  },
  {
    id: "C-003",
    name: "GreenSupply",
    company: "GreenSupply Inc.",
    contactName: "K. Rao",
    phone: "+91 98765 00003",
    email: "sales@greensupply.com",
    region: "Bangalore, Karnataka",
    openOrders: 0
  },

  // full clients from second list (different ids)
  {
    id: "C-REL",
    name: "Reliance Industries Ltd",
    industry: "Petrochemicals",
    contactName: "Arjun Mehta",
    email: "arjun.mehta@reliance.com",
    phone: "+91 98765 12345",
    address: "123 Business District, Mumbai, Maharashtra 400001",
    status: "active",
    contractValue: "₹18.75Cr",
    totalJobs: 45,
    rating: "4.8/5.0",
    paymentTerms: "Net 30"
  },
  {
    id: "C-LNT",
    name: "Larsen & Toubro Ltd",
    industry: "Construction",
    contactName: "Priya Nair",
    email: "priya.nair@lnt.com",
    phone: "+91 98765 12346",
    address: "456 Industrial Area, Chennai, Tamil Nadu 600001",
    status: "active",
    contractValue: "₹13.50Cr",
    totalJobs: 32,
    rating: "4.6/5.0",
    paymentTerms: "Net 15"
  },
  {
    id: "C-ADANI",
    name: "Adani Green Energy Ltd",
    industry: "Renewable Energy",
    contactName: "Rajesh Gupta",
    email: "rajesh.gupta@adani.com",
    phone: "+91 98765 12347",
    address: "789 Energy Complex, Ahmedabad, Gujarat 380001",
    status: "active",
    contractValue: "₹24.00Cr",
    totalJobs: 28,
    rating: "4.9/5.0",
    paymentTerms: "Net 45"
  },
  {
    id: "C-MAH",
    name: "Mahindra & Mahindra Ltd",
    industry: "Automotive",
    contactName: "Sunita Sharma",
    email: "sunita.sharma@mahindra.com",
    phone: "+91 98765 12348",
    address: "321 Auto Hub, Pune, Maharashtra 411001",
    status: "pending",
    contractValue: "₹11.25Cr",
    totalJobs: 0,
    rating: "No rating",
    paymentTerms: "Net 30"
  },
  {
    id: "C-FUT",
    name: "Future Retail Ltd",
    industry: "Retail",
    contactName: "Vikram Singh",
    email: "vikram.singh@futureretail.com",
    phone: "+91 98765 12349",
    address: "654 Commercial Zone, Delhi, Delhi 110001",
    status: "inactive",
    contractValue: "₹7.13Cr",
    totalJobs: 67,
    rating: "4.3/5.0",
    paymentTerms: "Net 30"
  }
]

export const contractsList = [
  {
    id: "CT-REL-2024",
    title: "Annual Heavy Transport Services",
    clientId: "C-REL",
    clientName: "Reliance Industries Ltd",
    description: "Comprehensive heavy vehicle transport services for petrochemical operations",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    services: ["Heavy Transport", "Freight Delivery", "24/7 Support"],
    value: "₹18.75Cr",
    status: "active"
  },
  {
    id: "CT-LNT-2024",
    title: "Construction Equipment Transport",
    clientId: "C-LNT",
    clientName: "Larsen & Toubro Ltd",
    description: "Transportation of construction equipment and materials to project sites",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    services: ["Equipment Transport", "Material Delivery", "Site Support"],
    value: "₹13.50Cr",
    status: "active"
  },
  {
    id: "CT-ADANI-2024",
    title: "Renewable Energy Equipment Transport",
    clientId: "C-ADANI",
    clientName: "Adani Green Energy Ltd",
    description: "Specialized transport services for renewable energy sector equipment and materials",
    startDate: "2024-02-10",
    endDate: "2025-01-31",
    services: ["Heavy Equipment Transport", "Specialized Cargo", "Emergency Services"],
    value: "₹24.00Cr",
    status: "active"
  }
]

export default {
  dashboardSample,
  vehiclesList,
  maintenanceList,
  salaryList,
  clientsList,
  contractsList
}
export const driversList = [
  {
    id: "DL-MH-202000001",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@hvms.com",
    location: "Mumbai, Maharashtra",
    status: "Assigned",
    assignedVehicle: "MH-01-AB-1234",
    experience: "8 years",
    rating: "4.8/5.0",
    totalMiles: "450,000",
    licenseExp: "2025-08-15",
  },
  {
    id: "DL-GJ-201800002",
    name: "Suresh Patel",
    phone: "+91 98765 43211",
    email: "suresh.patel@hvms.com",
    location: "Chennai, Tamil Nadu",
    status: "Assigned",
    assignedVehicle: "TN-09-GH-3456",
    experience: "12 years",
    rating: "4.9/5.0",
    totalMiles: "680,000",
    licenseExp: "2025-11-30",
  },
  {
    id: "DL-DL-202100003",
    name: "Priya Sharma",
    phone: "+91 98765 43212",
    email: "priya.sharma@hvms.com",
    location: "Delhi, Delhi",
    status: "Available",
    experience: "5 years",
    rating: "4.7/5.0",
    totalMiles: "275,000",
    licenseExp: "2025-05-18",
  },
  {
    id: "DL-UP-201600004",
    name: "Amit Singh",
    phone: "+91 98765 43213",
    email: "amit.singh@hvms.com",
    location: "Lucknow, Uttar Pradesh",
    status: "Available",
    experience: "16 years",
    rating: "4.8/5.0",
    totalMiles: "820,000",
    licenseExp: "2025-12-05",
  },
  {
    id: "DL-KA-202000005",
    name: "Kavita Reddy",
    phone: "+91 98765 43214",
    email: "kavita.reddy@hvms.com",
    location: "Bangalore, Karnataka",
    status: "On Leave",
    experience: "6 years",
    rating: "4.6/5.0",
    totalMiles: "320,000",
    licenseExp: "2025-09-12",
  },
  {
    id: "DL-MH-202200006",
    name: "Vikram Joshi",
    phone: "+91 98765 43215",
    email: "vikram.joshi@hvms.com",
    location: "Pune, Maharashtra",
    status: "Suspended",
    experience: "3 years",
    rating: "4.2/5.0",
    totalMiles: "180,000",
    licenseExp: "2025-07-08",
  },
];
