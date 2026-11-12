import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/applicationService';
import { schemeService } from '../services/schemeService';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Info,
  X,
  ExternalLink
} from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null); // for timeline view

  // New record form state
  const [formData, setFormData] = useState({
    schemeId: '',
    schemeName: '',
    referenceNumber: '',
    submissionDate: new Date().toISOString().split('T')[0],
    currentStatus: 'Submitted',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const [appsRes, schemesRes] = await Promise.all([
        applicationService.getApplications(),
        schemeService.getSchemes({ limit: 50 }),
      ]);
      if (appsRes.data) setApplications(appsRes.data);
      if (schemesRes.data) {
        setSchemes(schemesRes.data);
        if (schemesRes.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            schemeId: schemesRes.data[0].id || schemesRes.data[0]._id,
            schemeName: schemesRes.data[0].schemeName,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleSchemeChange = (e) => {
    const sId = e.target.value;
    const selected = schemes.find((s) => (s.id || s._id) === sId);
    setFormData({
      ...formData,
      schemeId: sId,
      schemeName: selected ? selected.schemeName : '',
    });
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!formData.referenceNumber.trim()) {
      setError('Please provide the application reference number.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await applicationService.createApplication(formData);
      setShowAddModal(false);
      setFormData({
        schemeId: schemes[0]?.id || schemes[0]?._id || '',
        schemeName: schemes[0]?.schemeName || '',
        referenceNumber: '',
        submissionDate: new Date().toISOString().split('T')[0],
        currentStatus: 'Submitted',
        notes: '',
      });
      fetchApps();
    } catch (err) {
      setError(err.message || 'Failed to save application record.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Verification':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Completed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#123B69]">Application Tracking Records</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your official application reference numbers, milestone notes, and verified status updates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Application</span>
        </button>
      </div>

      {/* Compliance Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Information: </strong>
          GovScheme maintains application records entered by citizens and updates made by authorized administrators. This tracker does not claim to retrieve direct live ministry API data without official authorized integration.
        </p>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse p-6"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Application Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Have you applied for a scheme through an official government website? Record your reference number here to keep track of its progress.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#123B69] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            + Record Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id || app._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 hover:border-[#123B69]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(app.currentStatus)}`}>
                    {app.currentStatus}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {app.sourceType === 'admin_verified' ? 'Admin Verified' : 'Citizen Recorded'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#123B69]">{app.schemeName}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>
                    Ref No: <strong className="font-bold text-slate-900">{app.referenceNumber}</strong>
                  </span>
                  <span>•</span>
                  <span>Submitted: {app.submissionDate}</span>
                </div>

                {app.notes && (
                  <p className="text-xs text-slate-500 italic mt-1 max-w-xl">
                    "{app.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Timeline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record New Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Record Scheme Application</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Government Scheme *
                </label>
                <select
                  value={formData.schemeId}
                  onChange={handleSchemeChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
                >
                  {schemes.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.schemeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Application Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PMKISAN-2026-98124 or NSP-REF-8841"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Current Status
                  </label>
                  <select
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Verification">Under Verification</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notes & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Submitted through local Gram Panchayat office. Biometric verification complete."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status History Timeline Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Status History</h3>
                <p className="text-xs text-slate-500">{selectedApp.schemeName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 block">Reference Number:</span>
              <strong className="text-slate-900 text-sm font-bold block">{selectedApp.referenceNumber}</strong>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                selectedApp.statusHistory.map((step, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-200 pb-4 last:pb-0">
                    <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#123B69]"></span>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{step.status}</span>
                      <span className="text-slate-400 text-[11px]">
                        {step.updatedAt ? new Date(step.updatedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{step.notes}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Updated by: {step.updatedBy || 'System'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No recorded history events.</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
