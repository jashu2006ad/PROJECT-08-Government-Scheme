import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function ApplicationAssistance() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchAssistanceData = async () => {
      setLoading(true);
      try {
        const schemeRes = await schemeService.getSchemeById(id);
        if (schemeRes.data) {
          const schemeData = schemeRes.data;
          setScheme(schemeData);

          // Initialize checklist from scheme required documents
          const defaultDocs = (schemeData.requiredDocuments || []).map((d) => ({
            name: d.name,
            description: d.description,
            mandatory: d.mandatory,
            status: 'Not Prepared',
          }));

          // If user is authenticated, fetch their saved checklist from DB
          if (isAuthenticated) {
            try {
              const savedChecklistRes = await applicationService.getDocumentChecklist(
                schemeData.id || schemeData._id
              );
              if (savedChecklistRes.data && savedChecklistRes.data.documents?.length > 0) {
                // Merge status
                const savedMap = {};
                savedChecklistRes.data.documents.forEach((d) => {
                  savedMap[d.name] = d.status;
                });
                const merged = defaultDocs.map((d) => ({
                  ...d,
                  status: savedMap[d.name] || 'Not Prepared',
                }));
                setChecklist(merged);
                setLoading(false);
                return;
              }
            } catch {}
          }
          setChecklist(defaultDocs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssistanceData();
  }, [id, isAuthenticated]);

  const toggleDocumentStatus = (docName) => {
    setChecklist((prev) =>
      prev.map((d) => {
        if (d.name === docName) {
          const newStatus = d.status === 'Prepared' ? 'Not Prepared' : 'Prepared';
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
    setSaveMessage('');
  };

  const handleSaveChecklist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      await applicationService.updateDocumentChecklist(scheme.id || scheme._id, checklist);
      setSaveMessage('Checklist saved successfully to your citizen dashboard!');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err) {
      setSaveMessage('Failed to save checklist.');
    } finally {
      setSaving(false);
    }
  };

  const preparedCount = checklist.filter((d) => d.status === 'Prepared').length;
  const progressPercent =
    checklist.length > 0 ? Math.round((preparedCount / checklist.length) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123B69] mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Application Checklist...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Scheme not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#138808] uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Step-by-Step Citizen Preparation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#123B69]">
          Application Assistance: {scheme.schemeName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Verify your eligibility, prepare mandatory documents, and follow official government instructions before submitting your application.
        </p>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-700">Document Readiness Progress</span>
            <span className="text-[#123B69]">{preparedCount} of {checklist.length} Prepared ({progressPercent}%)</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <ClipboardCheck className="w-5 h-5 text-[#123B69]" />
              <span>Interactive Document Checklist</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click each document to mark it as Prepared or Not Prepared.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveChecklist}
            disabled={saving}
            className="px-5 py-2.5 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            {saving ? 'Saving...' : 'Save Checklist State'}
          </button>
        </div>

        {saveMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {saveMessage}
          </div>
        )}

        <div className="space-y-3">
          {checklist.map((doc, idx) => {
            const isDone = doc.status === 'Prepared';
            return (
              <div
                key={idx}
                onClick={() => toggleDocumentStatus(doc.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDone ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {doc.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {doc.mandatory && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      Mandatory
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Step-by-Step Procedure */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-[#123B69]">
          How to Apply on Official Government Portal
        </h2>
        <div className="space-y-4">
          {scheme.applicationProcedure?.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <span className="w-8 h-8 rounded-xl bg-[#123B69] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Portal Redirect Callout */}
      <div className="bg-gradient-to-br from-[#123B69] to-[#0B2545] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF9933] block mb-1">
            Ready to Submit?
          </span>
          <h3 className="text-xl font-bold">Apply Directly on Government Website</h3>
          <p className="text-xs text-slate-300 max-w-md mt-1">
            Ensure you have prepared all required certificates above before beginning your submission.
          </p>
        </div>

        <a
          href={scheme.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-[#FF9933] hover:bg-amber-500 text-[#0B2545] font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 flex-shrink-0"
        >
          <span>Open Official Ministry Portal</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
