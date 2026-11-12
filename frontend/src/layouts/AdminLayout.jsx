import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Users,
  FileCheck2,
  Sliders,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
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

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const adminMenu = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Schemes', path: '/admin/schemes', icon: Layers },
    { label: 'Manage Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Manage Citizens', path: '/admin/users', icon: Users },
    { label: 'Application Records', path: '/admin/applications', icon: FileCheck2 },
    { label: 'Rule Engine Rules', path: '/admin/eligibility', icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />

      {/* Admin Top Banner */}
      <div className="bg-[#0B2545] text-amber-400 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>GovScheme National Administrative Console — Authorized Personnel Only</span>
          </div>
          <Link to="/dashboard" className="text-white hover:text-amber-300 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Citizen View</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Control Centre
                </span>
                <h3 className="font-bold text-slate-900 text-base">Scheme Administration</h3>
              </div>

              <nav className="space-y-1">
                {adminMenu.map((item) => {
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
              </nav>
            </div>
          </aside>

          {/* Admin Main Outlet */}
          <section className="lg:col-span-3">
            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
