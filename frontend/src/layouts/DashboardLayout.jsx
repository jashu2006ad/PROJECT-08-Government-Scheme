import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import {
  LayoutDashboard,
  Bookmark,
  FileText,
  User,
  CheckCircle,
  Shield,
  ArrowRight
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123B69]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const menuItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.savedSchemes'), path: '/saved-schemes', icon: Bookmark },
    { label: t('nav.myApplications'), path: '/my-applications', icon: FileText },
    { label: t('nav.profile'), path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              {/* User Bio Snapshot */}
              <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-[#123B69] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 truncate">{user?.fullName}</h3>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {user?.role === 'admin' ? 'Administrator' : 'Citizen Account'}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-[#123B69] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 hover:bg-amber-50 mt-4 border border-amber-200/70"
                  >
                    <Shield className="w-4 h-4 mr-3 text-amber-600" />
                    <span>{t('nav.admin')}</span>
                  </Link>
                )}
              </nav>

              {/* Quick Eligibility Action Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#123B69]/5 to-[#138808]/5 border border-slate-200/60">
                <p className="text-xs font-bold text-[#123B69] mb-1">Check New Schemes?</p>
                <p className="text-[11px] text-slate-600 mb-3">
                  Re-evaluate your eligibility across 10+ central and state schemes.
                </p>
                <Link
                  to="/eligibility"
                  className="inline-flex items-center text-xs font-bold text-[#123B69] hover:underline"
                >
                  <span>Open Checker</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <section className="lg:col-span-3">
            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
