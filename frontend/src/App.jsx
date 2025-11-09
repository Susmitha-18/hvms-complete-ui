import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";

// Pages
import Dashboard from "./pages/Dashboard";
import VehiclesPage from "./pages/VehiclesPage";
import AddVehicle from "./pages/AddVehicle";
import VehicleDetail from "./pages/VehicleDetail";
import DriversPage from "./pages/DriversPage";
import MaintenancePage from "./pages/MaintenancePage";
import MaintenanceAlerts from "./pages/MaintenanceAlerts";
import SalaryPage from "./pages/SalaryPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetail from "./pages/ClientDetail";
import AdminProfile from "./pages/AdminProfile";

// Driver feature pages
import DriverProfile from "./pages/DriverProfile";
import AssignVehicle from "./pages/AssignVehicle";
import AddDriver from "./pages/AddDriver";

// Auth pages
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";

// Vehicle detail/edit/profile pages
import VehicleProfile from "./pages/VehicleProfile";
import EditVehicle from "./pages/EditVehicle"; // ✅ Added import
import AssignmentDetails from "./pages/AssignmentDetails";
import EditDriver from "./pages/EditDriver";

import VehicleHistory from "./pages/VehicleHistory";
import MaintenanceDetails from "./pages/MaintenanceDetails"; // ✅ import it
import MaintenanceReport from "./pages/MaintenanceReport";
import ScheduleMaintenance from "./pages/ScheduleMaintenance";
import AddClient from "./pages/AddClient";
import SalaryHistoryPage from "./pages/SalaryHistoryPage";








export default function App() {
  const location = useLocation();
  let user = null;

  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    user = null;
  }

  const hideNavbar = ["/", "/login", "/forgot-password"].includes(location.pathname);

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!hideNavbar && <Navbar />}

      <main className={!hideNavbar ? "pt-6 pb-12" : ""}>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboards */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Common/Admin Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/add"
            element={
              <ProtectedRoute>
                <AddVehicle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <VehicleDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <DriversPage />
              </ProtectedRoute>
            }
          />

          {/* Driver Management */}
          <Route
            path="/driver/profile"
            element={
              <ProtectedRoute>
                <DriverProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/assign-vehicle"
            element={
              <ProtectedRoute>
                <AssignVehicle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/add"
            element={
              <ProtectedRoute>
                <AddDriver />
              </ProtectedRoute>
            }
          />

          {/* Maintenance & Other Pages */}
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <MaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/alerts"
            element={
              <ProtectedRoute>
                <MaintenanceAlerts />
              </ProtectedRoute>
            }
          />
                  <Route
                    path="/maintenance/schedule"
                    element={
                      <ProtectedRoute>
                        <ScheduleMaintenance />
                      </ProtectedRoute>
                    }
                  />
          <Route
            path="/salary"
            element={
              <ProtectedRoute>
                <SalaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          {/* ✅ Vehicle specific routes — placed BEFORE the fallback */}
          <Route
            path="/vehicle/profile"
            element={
              <ProtectedRoute>
                <VehicleProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle/edit"
            element={
              <ProtectedRoute>
                <EditVehicle />
              </ProtectedRoute>
            }
          />
<Route
  path="/driver/assignment-details"
  element={
    <ProtectedRoute>
      <AssignmentDetails />
    </ProtectedRoute>
  }
/>

          <Route path="/driver/edit" element={<EditDriver />} />
          <Route path="/vehicle/history" element={<VehicleHistory />} />
          <Route path="/maintenance/details" element={<MaintenanceDetails />} />
          {/* ✅ New Report Page Route */}
          <Route path="/maintenance/report" element={<MaintenanceReport />} />
          <Route path="/clients/add" element={<AddClient />} />
          <Route path="/salaryhistory" element={<SalaryHistoryPage />} />

          {/* Fallback must be LAST */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
