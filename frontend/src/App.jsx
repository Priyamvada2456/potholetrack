import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import ReportFormPage from "./pages/ReportFormPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import StatsPage from "./pages/StatsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

export default function App() {
  return (
    <div className="min-h-screen bg-concrete-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<ReportFormPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
