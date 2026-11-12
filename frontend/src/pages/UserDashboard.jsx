import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { schemeService } from '../services/schemeService';
import { applicationService } from '../services/applicationService';
import { eligibilityService } from '../services/eligibilityService';
import { authService } from '../services/authService';
import {
  Bookmark,
  FileText,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [eligibilityHistory, setEligibilityHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [savedRes, appsRes, eligRes, actRes] = await Promise.all([
          schemeService.getSavedSchemes(),
          applicationService.getApplications(),
          eligibilityService.getHistory(),
          authService.getUserActivity(),
        ]);

        if (savedRes?.data) setSavedSchemes(savedRes.data);
        if (appsRes?.data) setApplications(appsRes.data);
        if (eligRes?.data) setEligibilityHistory(eligRes.data);
        if (actRes?.data) setActivities(actRes.data);
      } catch (err) {
        console.warn('Dashboard data fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate profile completion percentage
  let profilePoints = 0;
  if (user?.fullName) profilePoints += 25;
  if (user?.email) profilePoints += 25;
  if (user?.mobile) profilePoints += 25;
  if (user?.state && user?.district) profilePoints += 25;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Welcome Header Banner */}
      <div className="bg-gradient-to-r from-[#123B69] via-[#0B2545] to-[#123B69] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        {/* Subtle tricolor badge */}
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FF9933] uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-[#FF9933]" />
          <span>Citizen Welfare Workspace</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Manage your saved welfare schemes, track recorded application reference numbers, and review eligibility evaluation records.
        </p>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              Profile Readiness: {profilePoints}%
            </span>
          </div>
          <Link
            to="/profile"
            className="text-xs font-bold text-[#FF9933] hover:underline"
          >
            Update Profile Information →
          </Link>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Schemes
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {savedSchemes.length}
          </span>
          <Link
            to="/saved-schemes"
            className="block text-[11px] font-semibold text-[#123B69] hover:underline mt-2"
          >
            View Bookmarks →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {applications.length}
          </span>
          <Link
            to="/my-applications"
            className="block text-[11px] font-semibold text-[#123B69] hover:underline mt-2"
          >
            Track Status →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Eligibility Runs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {eligibilityHistory.length}
          </span>
          <Link
            to="/eligibility"
            className="block text-[11px] font-semibold text-[#123B69] hover:underline mt-2"
          >
            Run New Check →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Citizen State
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-900 truncate block">
            {user?.state || 'National'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-2">
            {user?.district || 'General Jurisdiction'}
          </span>
        </div>
      </div>

      {/* 3. My Applications Quick Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Application Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal reference numbers and statuses recorded in the portal.
            </p>
          </div>
          <Link
            to="/my-applications"
            className="text-xs font-bold text-[#123B69] hover:underline flex items-center space-x-1"
          >
            <span>Manage All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs text-slate-500 mb-3">No application records saved yet.</p>
            <Link
              to="/my-applications"
              className="px-4 py-2 bg-[#123B69] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              + Record New Application
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id || app._id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{app.schemeName}</h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span>Ref: <strong className="text-slate-800">{app.referenceNumber}</strong></span>
                    <span>•</span>
                    <span>Submitted: {app.submissionDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.currentStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.currentStatus === 'Under Verification'
                        ? 'bg-amber-100 text-amber-800'
                        : app.currentStatus === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {app.currentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Saved Schemes Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Saved Schemes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Flagged government initiatives for your quick reference.
            </p>
          </div>
          <Link
            to="/saved-schemes"
            className="text-xs font-bold text-[#123B69] hover:underline flex items-center space-x-1"
          >
            <span>View All ({savedSchemes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {savedSchemes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs text-slate-500 mb-3">You have not bookmarked any schemes yet.</p>
            <Link
              to="/schemes"
              className="px-4 py-2 bg-[#123B69] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Browse Government Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedSchemes.slice(0, 4).map((s) => (
              <div
                key={s.id || s._id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#123B69] transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {s.categoryName || 'General'}
                  </span>
                  <h4 className="text-sm font-bold text-[#123B69] mt-2 line-clamp-1">
                    {s.schemeName}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {s.benefits}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/schemes/${s.slug || s.id || s._id}`}
                    className="font-bold text-[#123B69] hover:underline"
                  >
                    View Details →
                  </Link>
                  <Link
                    to={`/assistance/${s.slug || s.id || s._id}`}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    Checklist
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Recent Activity Logs */}
      {activities.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <span>Recent Activity Audit Log</span>
          </h2>
          <div className="space-y-3">
            {activities.slice(0, 5).map((act, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-none">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-semibold text-slate-800">{act.description}</span>
                </div>
                <span className="text-slate-400">
                  {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
