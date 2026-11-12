import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  MapPin,
  Users,
  Coins,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Info
} from 'lucide-react';

export default function SchemeDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      try {
        const res = await schemeService.getSchemeById(id);
        if (res.data) {
          setScheme(res.data);
          // Check if already saved
          if (isAuthenticated) {
            try {
              const savedList = await schemeService.getSavedSchemes();
              if (savedList.data) {
                const found = savedList.data.some(
                  (s) => s.id === res.data.id || s._id === res.data.id || s.slug === res.data.slug
                );
                setIsSaved(found);
              }
            } catch {}
          }
        }
      } catch (err) {
        setError(err.message || 'Scheme details could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id, isAuthenticated]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await schemeService.unsaveScheme(scheme.id || scheme._id);
        setIsSaved(false);
      } else {
        await schemeService.saveScheme(scheme.id || scheme._id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123B69] mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading verified scheme details...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Scheme Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'The requested scheme does not exist.'}</p>
          <Link
            to="/schemes"
            className="px-5 py-2.5 bg-[#123B69] text-white font-bold text-sm rounded-xl"
          >
            Back to Scheme Explorer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        {/* Tricolor top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              {scheme.categoryName || 'Welfare Scheme'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#138808]" />
              Official Government Scheme
            </span>
          </div>

          {/* Action: Save Bookmark */}
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              isSaved
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved to Bookmarks' : 'Save Scheme'}</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#123B69] tracking-tight leading-tight mb-4">
          {scheme.schemeName}
        </h1>

        <p className="text-base text-slate-600 leading-relaxed max-w-4xl mb-6">
          {scheme.description}
        </p>

        {/* Quick Snapshot Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <Users className="w-5 h-5 text-[#123B69] flex-shrink-0" />
            <div>
              <span className="block font-bold text-slate-900">Target Beneficiaries</span>
              <span className="truncate">{scheme.targetBeneficiaries || 'Indian Citizens'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <MapPin className="w-5 h-5 text-[#138808] flex-shrink-0" />
            <div>
              <span className="block font-bold text-slate-900">Applicable States</span>
              <span>{scheme.applicableStates?.join(', ') || 'All India'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <Calendar className="w-5 h-5 text-[#FF9933] flex-shrink-0" />
            <div>
              <span className="block font-bold text-slate-900">Last Verified</span>
              <span>
                {scheme.lastVerifiedAt
                  ? new Date(scheme.lastVerifiedAt).toLocaleDateString()
                  : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Apply, Eligibility, Document checklist */}
        <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowRedirectModal(true)}
            className="px-6 py-3.5 bg-[#123B69] hover:bg-[#0B2545] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center space-x-2"
          >
            <span>Visit Official Application Portal</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <Link
            to="/eligibility"
            className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#123B69] border-2 border-[#123B69] font-bold text-sm rounded-xl shadow-sm transition-all inline-flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#138808]" />
            <span>Check My Eligibility</span>
          </Link>

          <Link
            to={`/assistance/${scheme.id || scheme._id || scheme.slug}`}
            className="px-6 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm rounded-xl transition-all inline-flex items-center space-x-2"
          >
            <ClipboardList className="w-4 h-4 text-[#138808]" />
            <span>Prepare Document Checklist</span>
          </Link>
        </div>
      </div>

      {/* 2. Scheme Objectives & Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Objectives */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#123B69] mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#FF9933]" />
            <span>Scheme Objectives</span>
          </h2>
          {scheme.objectives && scheme.objectives.length > 0 ? (
            <ul className="space-y-3">
              {scheme.objectives.map((obj, i) => (
                <li key={i} className="flex items-start text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-[#123B69] font-bold text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Official objectives outlined by ministry guidelines.</p>
          )}
        </div>

        {/* Benefits Highlight */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200/80 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-emerald-950 mb-3 flex items-center space-x-2">
              <Coins className="w-5 h-5 text-[#138808]" />
              <span>Entitlements & Benefits</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-900 leading-relaxed font-medium">
              {scheme.benefits}
            </p>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-white/80 border border-emerald-200 text-xs text-emerald-800">
            <strong>Direct Benefit Transfer (DBT): </strong>
            Financial assistance is transferred directly into Aadhaar-seeded citizen bank accounts without intermediaries.
          </div>
        </div>
      </div>

      {/* 3. Detailed Eligibility Criteria */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#123B69] flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#138808]" />
          <span>Eligibility Requirements</span>
        </h2>

        {scheme.eligibility?.summary && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Eligibility Overview:</strong>
            {scheme.eligibility.summary}
          </div>
        )}

        {/* Condition details if rule exists */}
        {scheme.eligibility?.rule?.conditions && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Automated Rule Criteria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheme.eligibility.rule.conditions.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center space-x-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#138808] font-bold flex items-center justify-center flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-slate-800 font-medium">
                    {c.description || `${c.field} ${c.operator} ${c.value}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Required Documents Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#123B69] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#123B69]" />
            <span>Required Documents</span>
          </h2>
          <Link
            to={`/assistance/${scheme.id || scheme._id || scheme.slug}`}
            className="text-xs font-bold text-[#123B69] hover:underline flex items-center space-x-1"
          >
            <span>Interactive Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scheme.requiredDocuments?.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-3"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{doc.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{doc.description}</p>
              </div>
              {doc.mandatory && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex-shrink-0">
                  Mandatory
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Application Procedure */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#123B69] flex items-center space-x-2">
          <ClipboardList className="w-5 h-5 text-[#FF9933]" />
          <span>Step-by-Step Application Procedure</span>
        </h2>

        <div className="space-y-4">
          {scheme.applicationProcedure?.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <span className="w-8 h-8 rounded-xl bg-[#123B69] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                {idx + 1}
              </span>
              <div className="pt-1">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Verification and Official Source Reference */}
      <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-800 block mb-1">Official Information Source:</span>
          <a
            href={scheme.officialSourceUrl || scheme.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#123B69] hover:underline flex items-center space-x-1"
          >
            <span className="truncate max-w-md">{scheme.officialSourceUrl || scheme.applicationUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
        <div className="text-slate-500 sm:text-right">
          <span>Verified Status: Active & Authentic</span>
        </div>
      </div>

      {/* Redirect Disclaimer Modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                External Government Portal Notice
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You are now navigating to the official authorized portal:
                <br />
                <span className="font-bold text-[#123B69] break-all">{scheme.applicationUrl}</span>
                <br />
                GovScheme does not collect official application fees. Proceed to complete your submission on the ministry site.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRedirectModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>
              <a
                href={scheme.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowRedirectModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold text-center shadow-md transition-colors"
              >
                Proceed to Official Portal
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
