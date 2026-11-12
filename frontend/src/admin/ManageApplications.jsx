import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import {
  FileCheck2,
  Filter,
  Edit,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const [updateStatus, setUpdateStatus] = useState('Approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await adminService.getApplications({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.data) setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter]);

  const openStatusModal = (app) => {
    setSelectedApp(app);
    setUpdateStatus(app.currentStatus);
    setAdminNotes('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSaving(true);
    try {
      await adminService.updateApplicationStatus(
        selectedApp.id || selectedApp._id,
        updateStatus,
        adminNotes
      );
      setSelectedApp(null);
      fetchApps();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Application Pipeline Records</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review citizen application submissions and update verification milestones.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Citizen</th>
                <th className="p-4">Scheme</th>
                <th className="p-4">Reference No</th>
                <th className="p-4">Current Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a.id || a._id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{a.user?.fullName || 'Citizen'}</span>
                    <span className="text-[11px] text-slate-400">{a.user?.email}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">{a.schemeName}</td>
                  <td className="p-4 font-mono text-slate-600">{a.referenceNumber}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                      {a.currentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => openStatusModal(a)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Application Status</h3>
                <p className="text-xs text-slate-500">{selectedApp.referenceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Status *
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Administrative Verification Note
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Land revenue verification completed by Tahsildar. Sanction granted."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
