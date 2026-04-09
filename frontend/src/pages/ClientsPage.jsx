import React, { useEffect, useState } from "react";
import ClientsOverview from "../widgets/ClientsOverview";
import ClientCard from "../widgets/ClientCard";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function ClientsPage() {
  const [tab, setTab] = useState("overview");
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [unavailableVehicleIds, setUnavailableVehicleIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
  const cRes = await axios.get("/api/clients");
        setClients(cRes.data.clients || []);
      } catch {
        console.error("Error fetching clients");
      }

      try {
  const ctRes = await axios.get("/api/contracts");
        setContracts(ctRes.data.contracts || []);
      } catch {
        console.error("Error fetching contracts");
      }

      try {
  const vRes = await axios.get("/api/vehicles");
        setVehicles(vRes.data.vehicles || []);
      } catch {
        console.error("Error fetching vehicles");
      }
    };
    load();
  }, [location]);

  // ✅ State to track unavailable vehicles for selected work date
  const [form, setForm] = useState({
    problem: "",
    contractAmount: "",
    durationDays: "",
    durationHours: "",
    location: "",
    vehicleId: "",
    workDate: "",
  });

  // ✅ Fetch unavailable vehicles when date changes
  useEffect(() => {
    if (!form.workDate) return;
    axios
      .get(`/api/contracts/unavailable/${form.workDate}`)
      .then((res) => setUnavailableVehicleIds(res.data.bookedVehicleIds || []))
      .catch(() => setUnavailableVehicleIds([]));
  }, [form.workDate]);



  const filteredClients = clients.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.industry?.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "All" ||
      (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());
    const matchesIndustry =
      industryFilter === "All" ||
      (c.industry &&
        c.industry.toLowerCase() === industryFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold">Client Management</h1>
        <p className="text-gray-500 mt-1">
          Manage client relationships, contracts, and vehicle assignments
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-200 rounded-lg p-1 mb-6 flex gap-2">
        <Tab label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
        <Tab label="Clients" active={tab === "clients"} onClick={() => setTab("clients")} />
        <Tab label="Contracts" active={tab === "contracts"} onClick={() => setTab("contracts")} />
      </div>

      {tab === "overview" && (
        <ClientsOverview clients={clients} contracts={contracts} />
      )}

      {/* Clients Tab */}
      {tab === "clients" && (
        <div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              className="flex-1 rounded-lg p-3 bg-white border"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-lg p-3 bg-white border"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select
              className="rounded-lg p-3 bg-white border"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option>All</option>
              <option>Manufacturing</option>
              <option>Logistics</option>
              <option>Construction</option>
              <option>IT Services</option>
              <option>Other</option>
            </select>
            <button
              onClick={() => navigate("/clients/add")}
              className="ml-auto px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              + Add New Client
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => <ClientCard key={c._id || c.id} c={c} />)
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-10">
                No clients found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contracts Tab */}
      {tab === "contracts" && (
        <ContractsSection
          clients={clients}
          vehicles={vehicles}
          contracts={contracts}
          setContracts={setContracts}
        />
      )}
    </div>
  );
}

/* ---------- Helper Components ---------- */
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded text-sm font-medium ${
        active ? "bg-gray-900 text-white shadow-inner" : "text-gray-600 hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

/* ✅ Contract Section */
function ContractsSection({ clients, vehicles, contracts, setContracts }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [form, setForm] = useState({
    problem: "",
    contractAmount: "",
    durationDays: "",
    durationHours: "",
    location: "",
    vehicleId: "",
    workDate: "",
    endDate: "",
  });
  const [unavailableVehicleIds, setUnavailableVehicleIds] = useState([]);

  // ✅ Fetch unavailable vehicles for the selected date
  useEffect(() => {
    if (!form.workDate) return;
    axios
      .get(`/api/contracts/unavailable/${form.workDate}`)
      .then((res) => setUnavailableVehicleIds(res.data.bookedVehicleIds || []))
      .catch(() => setUnavailableVehicleIds([]));
  }, [form.workDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
const handleSave = async (e) => {
  e.preventDefault();

  if (!selectedClient) {
    alert("⚠️ Please select a client!");
    return;
  }
  if (!form.vehicleId) {
    alert("⚠️ Please select a vehicle!");
    return;
  }
  if (!form.workDate) {
    alert("⚠️ Please choose a start date!");
    return;
  }

  try {
    console.log("Form before save:", form);

    // Build payload explicitly (avoids override issues)
    const payload = {
      clientId: selectedClient,
      vehicleId: form.vehicleId?._id || form.vehicleId,
      workDate: form.workDate, // ✅ ensure start date is sent
      endDate: form.endDate || form.workDate, // fallback if no endDate
      problem: form.problem,
      contractAmount: form.contractAmount,
      durationDays: form.durationDays,
      durationHours: form.durationHours,
      location: form.location,
      status: "Active",
    };

  const res = await axios.post("/api/contracts", payload);

    if (res.status === 201 && res.data.contract) {
      alert("✅ Contract added successfully!");
      setContracts((prev) => [res.data.contract, ...prev]);
      setForm({
        problem: "",
        contractAmount: "",
        durationDays: "",
        durationHours: "",
        location: "",
        vehicleId: "",
        workDate: "",
        endDate: "",
      });
      setSelectedClient("");
      setUnavailableVehicleIds([]);
    }
  } catch (err) {
    console.error("❌ Error saving contract:", err);
    alert("Failed to save contract");
  }
};


  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📄 Add New Contract</h2>

      {/* Add Contract Form */}
      <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Select Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
<Input
  label="Start Date"
  type="date"
  name="workDate"
  value={form.workDate ? form.workDate.split("T")[0] : ""}
  onChange={handleChange}
/>
<Input
  label="End Date"
  type="date"
  name="endDate"
  value={form.endDate ? form.endDate.split("T")[0] : ""}
  onChange={handleChange}
/>


        <Input label="Problem Description" name="problem" value={form.problem} onChange={handleChange} />
        <Input label="Contract Amount (₹)" name="contractAmount" value={form.contractAmount} onChange={handleChange} />
        <Input label="Duration (Days)" name="durationDays" value={form.durationDays} onChange={handleChange} />
        <Input label="Duration (Hours)" name="durationHours" value={form.durationHours} onChange={handleChange} />
        <Input label="Location" name="location" value={form.location} onChange={handleChange} />

        {/* Assign Vehicle Dropdown */}
        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Assign Vehicle</label>
          <select
            name="vehicleId"
            value={form.vehicleId}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select vehicle...</option>
            {vehicles.map((v) => (
              <option
                key={v._id}
                value={v._id}
                disabled={unavailableVehicleIds.includes(v._id)}
              >
                {v.name} ({v.registrationNumber})
                {unavailableVehicleIds.includes(v._id) ? " — (Unavailable)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            💾 Save Contract
          </button>
        </div>
      </form>

      {/* Contracts List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Existing Contracts</h3>
        {contracts.length === 0 ? (
          <p className="text-gray-500 italic">No contracts yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {contracts.map((contract) => (
              <EditableContractCard
                key={contract._id}
                contract={contract}
                clients={clients}
                vehicles={vehicles}
                onUpdate={(updated) =>
                  setContracts((prev) =>
                    prev.map((c) => (c._id === updated._id ? updated : c))
                  )
                }
                onRefreshVehicles={() => setUnavailableVehicleIds([])}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* Editable Contract Card */
function EditableContractCard({ contract, clients, vehicles, onUpdate, onRefreshVehicles }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(contract);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
  const res = await axios.put(`/api/contracts/${contract._id}`, {
  ...editData,
  workDate: editData.workDate,
  endDate: editData.endDate,
  vehicleId: editData.vehicleId?._id || editData.vehicleId,
});


      if (res.status === 200 && res.data.contract) {
        alert("✅ Contract updated!");
        onUpdate(res.data.contract);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("❌ Error updating contract:", err);
      alert("Failed to update contract");
    }
  };

  const markAsComplete = async () => {
  try {
    const res = await axios.put(`/api/contracts/${contract._id}`, {
      status: "Completed",
      vehicleId: contract.vehicleId?._id || contract.vehicleId,
    });

      if (res.status === 200 && res.data.contract) {
        onUpdate(res.data.contract);
        alert("✅ Marked as completed — Vehicle now available!");
        onRefreshVehicles(); // 🔁 refresh vehicle list availability
      }
    } catch (err) {
      console.error("❌ Error marking complete:", err);
    }
  };
const clientName =
  contract.clientId?.name ||
  clients.find((c) => String(c._id) === String(contract.clientId))?.name ||
  "Unknown Client";


  return (
    <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{clientName}</h4>

      {isEditing ? (
        <div className="grid grid-cols-2 gap-3">
<Input
  label="Start Date"
  type="date"
  name="workDate"
  value={editData.workDate ? editData.workDate.split("T")[0] : ""}
  onChange={handleEditChange}
/>
<Input
  label="End Date"
  type="date"
  name="endDate"
  value={editData.endDate ? editData.endDate.split("T")[0] : ""}
  onChange={handleEditChange}
/>

<Input label="Problem" name="problem" value={editData.problem} onChange={handleEditChange} />

{/* Vehicle Dropdown */}
<div className="col-span-2">
  <label className="block text-gray-700 mb-1">Assign Vehicle</label>
  <select
    name="vehicleId"
    value={editData.vehicleId?._id || editData.vehicleId || ""}
    onChange={handleEditChange}
    className="w-full border rounded-lg p-2"
  >
    <option value="">Select vehicle...</option>
    {vehicles.map((v) => (
      <option key={v._id} value={v._id}>
        {v.name} ({v.registrationNumber})
      </option>
    ))}
  </select>
</div>

          <Input label="Amount (₹)" name="contractAmount" value={editData.contractAmount} onChange={handleEditChange} />
          <Input label="Days" name="durationDays" value={editData.durationDays} onChange={handleEditChange} />
          <Input label="Hours" name="durationHours" value={editData.durationHours} onChange={handleEditChange} />
          <Input label="Location" name="location" value={editData.location} onChange={handleEditChange} />

          <div className="col-span-2 flex justify-end gap-3 mt-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              ✅ Save
            </button>
          </div>
        </div>
      ) : (
        <><p><strong>Start Date:</strong> {contract.workDate ? contract.workDate.split("T")[0] : "—"}</p>
<p><strong>End Date:</strong> {contract.endDate ? contract.endDate.split("T")[0] : "—"}</p>

          <p><strong>Problem:</strong> {contract.problem}</p>
          <p><strong>Amount:</strong> ₹{contract.contractAmount}</p>
          <p><strong>Duration:</strong> {contract.durationDays} days {contract.durationHours} hrs</p>
          <p><strong>Location:</strong> {contract.location}</p>
          <p><strong>Status:</strong> {contract.status}</p>
<p><strong>Vehicle:</strong> {contract.vehicleId?.name || "—"}</p>

          <div className="flex justify-end gap-3 mt-3">
            {contract.status === "Active" && (
              <button
                onClick={markAsComplete}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
              >
                ✅ Mark as Complete
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ✏️ Edit
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* Reusable Input Component */
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}
