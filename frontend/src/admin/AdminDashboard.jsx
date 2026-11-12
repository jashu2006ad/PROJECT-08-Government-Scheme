import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  Users,
  Layers,
  FileCheck2,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.data) setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-3xl bg-white border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const statusDist = dashboardData?.statusDistribution || {};
  const recentApps = dashboardData?.recentApplications || [];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Welcome Card */}
      <div className="bg-[#123B69] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF9933] block mb-1">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Portal Control Panel</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time administrative metrics, verified scheme catalog management, and application audits.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#FF9933]">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Citizens
          </span>
          <span className="text-3xl font-black text-slate-900">{metrics.totalUsers || 0}</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
            {metrics.activeUsers || 0} Active Accounts
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Listed Schemes
          </span>
          <span className="text-3xl font-black text-[#123B69]">{metrics.totalSchemes || 0}</span>
          <span className="text-[11px] text-slate-500 block mt-1 font-semibold">
            {metrics.activeSchemes || 0} Published Active
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Applications
          </span>
          <span className="text-3xl font-black text-slate-900">{metrics.totalApplications || 0}</span>
          <span className="text-[11px] text-blue-600 block mt-1 font-semibold">
            Across All Categories
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Eligibility Checks
          </span>
          <span className="text-3xl font-black text-emerald-600">
            {metrics.totalEligibilityChecks || 0}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1 font-semibold">
            Rule Executions
          </span>
        </div>
      </div>

      {/* Status Distribution Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Application Pipeline Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(statusDist).map(([st, cnt]) => (
            <div key={st} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center">
              <span className="block text-xl font-black text-slate-800">{cnt}</span>
              <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">{st}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Audit Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Applications Logged</h2>
          <Link
            to="/admin/applications"
            className="text-xs font-bold text-[#123B69] hover:underline flex items-center space-x-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Scheme</th>
                <th className="p-3">Reference No</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl">Submission Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApps.map((a) => (
                <tr key={a.id || a._id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800">{a.schemeName}</td>
                  <td className="p-3 text-slate-600 font-mono">{a.referenceNumber}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {a.currentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{a.submissionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
