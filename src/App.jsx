import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./auth/AuthContext";
import LanguageProvider from "./contexts/LanguageContext";
import RoleRoute from "./auth/RoleRoute";

import MainLayout from "./components/layout/MainLayout";
import LandExplorer from "./components/pages/LandExplorer";

import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import HomePage from "./components/pages/HomePage";
import ResetPassword from "./components/pages/ResetPassword";
import ForgotPassword from "./components/pages/ForgotPassword";
import LandTaxRegistration from "./components/pages/LandTaxRegistration";

import DagSearchMap from "./components/pages/DagSearchMap";

import AdminLayout, { AdminHome } from "./components/dashboard/admin/Dashboard";
import AdminDivisions from "./components/dashboard/admin/AdminDivisions";
import AdminDistricts from "./components/dashboard/admin/AdminDistricts";
import AdminUpazilas from "./components/dashboard/admin/AdminUpazilas";
import AdminMouzas from "./components/dashboard/admin/AdminMouzas";
import AdminZils from "./components/dashboard/admin/AdminZils";
import AdminDags from "./components/dashboard/admin/AdminDags";
import AdminSurveyTypes from "./components/dashboard/admin/AdminSurveyTypes";
import KycApproval from "./components/dashboard/admin/KycApproval";
import AdminLandTaxRegistrations from "./components/dashboard/admin/AdminLandTaxRegistrations";
import AdminMutations from "./components/dashboard/admin/AdminMutations";
import AdminMouzaMaps from "./components/dashboard/admin/AdminMouzaMaps";

import AdminDrawMap from "./components/dashboard/admin/AdminDrawMap";
import AdminRevenue from "./components/dashboard/admin/AdminRevenue";

import UserDashboard from "./components/dashboard/user/Dashboard";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: { fontSize: "14px", borderRadius: "10px" },
              success: {
                icon: "✅",
                style: {
                  background: "#16a34a",
                  color: "#fff",
                },
              },
              error: {
                icon: "⚠️",
                style: {
                  background: "#dc2626",
                  color: "#fff",
                },
              },
            }}
          />
          <Routes>
            {/* Public routes with header & footer */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />

            <Route
              path="/login"
              element={
                <MainLayout>
                  <Login />
                </MainLayout>
              }
            />

            <Route
              path="/register"
              element={
                <MainLayout>
                  <Register />
                </MainLayout>
              }
            />

            <Route
              path="/land"
              element={
                <MainLayout>
                  <LandExplorer />
                </MainLayout>
              }
            />

            <Route
              path="/land-tax"
              element={
                <MainLayout>
                  <LandTaxRegistration />
                </MainLayout>
              }
            />

            <Route
              path="/dag-search-map"
              element={
                <MainLayout>
                  <DagSearchMap />
                </MainLayout>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <MainLayout>
                  <ForgotPassword />
                </MainLayout>
              }
            />

            <Route
              path="/reset-password"
              element={
                <MainLayout>
                  <ResetPassword />
                </MainLayout>
              }
            />

            {/* --- ADMIN: No header/footer (uses sidebar layout) --- */}
            <Route
              path="/admin"
              element={
                <RoleRoute allow={["admin", "acland"]}>
                  <AdminLayout />
                </RoleRoute>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="divisions" element={<AdminDivisions />} />
              <Route path="districts" element={<AdminDistricts />} />
              <Route path="upazilas" element={<AdminUpazilas />} />
              <Route path="mouzas" element={<AdminMouzas />} />
              <Route path="survey-types" element={<AdminSurveyTypes />} />
              <Route path="zils" element={<AdminZils />} />
              <Route path="dags" element={<AdminDags />} />
              <Route path="kyc-approvals" element={<KycApproval />} />
              <Route
                path="land-tax-registrations"
                element={<AdminLandTaxRegistrations />}
              />
              <Route path="mutations" element={<AdminMutations />} />
              <Route path="mouza-maps" element={<AdminMouzaMaps />} />
              <Route path="draw-maps" element={<AdminDrawMap />} />
              <Route path="revenue" element={<AdminRevenue />} />
            </Route>

            {/* User dashboard - NOW WITH header/footer */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute allow={["user", "acland", "admin"]}>
                  <MainLayout>
                    <UserDashboard />
                  </MainLayout>
                </RoleRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
