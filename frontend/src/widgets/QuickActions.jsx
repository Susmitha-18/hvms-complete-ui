import React from 'react'
export default function QuickActions(){
	return (
		<div className="card card-shadow p-6" style={{background: 'linear-gradient(180deg,#FEF9C3,#FBF7D6)'}}>
			<h4 className="font-semibold mb-4">Quick Actions</h4>
			<div className="space-y-3">
				<button className="w-full text-left rounded-md px-3 py-2 bg-gray-900 text-white flex items-center gap-3">🚚 Manage Vehicles</button>
				<button className="w-full text-left rounded-md px-3 py-2 bg-gray-900 text-white flex items-center gap-3">👨‍✈️ Driver Management</button>
				<button className="w-full text-left rounded-md px-3 py-2 bg-gray-900 text-white flex items-center gap-3">🛠️ Maintenance Tracking</button>
			</div>
		</div>
	)
}
