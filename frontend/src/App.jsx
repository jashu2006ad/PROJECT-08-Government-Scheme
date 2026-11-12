import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import ExploreSchemes from './pages/ExploreSchemes';
import SchemeDetails from './pages/SchemeDetails';
import Categories from './pages/Categories';
import EligibilityChecker from './pages/EligibilityChecker';
import ApplicationAssistance from './pages/ApplicationAssistance';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// User Dashboard Pages
import UserDashboard from './pages/UserDashboard';
import SavedSchemes from './pages/SavedSchemes';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import ManageSchemes from './admin/ManageSchemes';
import ManageCategories from './admin/ManageCategories';
import ManageUsers from './admin/ManageUsers';
import ManageApplications from './admin/ManageApplications';
import ManageEligibility from './admin/ManageEligibility';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/schemes" element={<ExploreSchemes />} />
              <Route path="/schemes/:id" element={<SchemeDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/eligibility" element={<EligibilityChecker />} />
              <Route path="/assistance/:id" element={<ApplicationAssistance />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/404" element={<NotFound />} />
            </Route>

            {/* Authenticated Citizen Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/saved-schemes" element={<SavedSchemes />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Protected Admin Console Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/schemes" element={<ManageSchemes />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/applications" element={<ManageApplications />} />
              <Route path="/admin/eligibility" element={<ManageEligibility />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
