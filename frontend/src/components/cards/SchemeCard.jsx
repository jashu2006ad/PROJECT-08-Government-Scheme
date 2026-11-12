import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { schemeService } from '../../services/schemeService';
import {
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Sprout,
  HeartPulse,
  Home,
  GraduationCap,
  Shield,
  Briefcase,
  Users,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export default function SchemeCard({ scheme, isSavedInitially = false, onSaveToggle }) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const getCategoryIcon = (catName = '') => {
    const lower = catName.toLowerCase();
    if (lower.includes('agri')) return <Sprout className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('health')) return <HeartPulse className="w-4 h-4 text-rose-600" />;
    if (lower.includes('hous')) return <Home className="w-4 h-4 text-amber-600" />;
    if (lower.includes('edu')) return <GraduationCap className="w-4 h-4 text-indigo-600" />;
    if (lower.includes('pension')) return <Shield className="w-4 h-4 text-teal-600" />;
    if (lower.includes('skill') || lower.includes('employ')) return <Briefcase className="w-4 h-4 text-orange-600" />;
    if (lower.includes('women') || lower.includes('child')) return <Users className="w-4 h-4 text-pink-600" />;
    return <Coins className="w-4 h-4 text-blue-600" />;
  };

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await schemeService.unsaveScheme(scheme.id || scheme._id);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(scheme.id || scheme._id, false);
      } else {
        await schemeService.saveScheme(scheme.id || scheme._id);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(scheme.id || scheme._id, true);
      }
    } catch (err) {
      console.error('Failed to toggle save scheme:', err);
    } finally {
      setSaving(false);
    }
  };

  const schemeId = scheme.id || scheme._id || scheme.slug;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-[#123B69]/30 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#123B69] via-[#FF9933] to-[#138808] opacity-80 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Category Badge + Save Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {getCategoryIcon(scheme.categoryName)}
            <span>{scheme.categoryName || 'General Welfare'}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleSave}
            disabled={saving}
            title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
            className={`p-2 rounded-full transition-colors ${
              isSaved
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'text-slate-400 hover:text-[#123B69] hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Scheme Title */}
        <Link to={`/schemes/${scheme.slug || schemeId}`}>
          <h3 className="text-lg font-bold text-[#123B69] hover:text-[#0B2545] leading-snug mb-2 group-hover:underline line-clamp-2">
            {scheme.schemeName}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {scheme.description}
        </p>

        {/* Highlight: Key Benefit */}
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-2.5">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              {t('popular.benefits')}
            </span>
            <p className="text-xs font-medium text-emerald-950 line-clamp-2">
              {scheme.benefits}
            </p>
          </div>

          {/* Target Beneficiaries */}
          {scheme.targetBeneficiaries && (
            <div className="flex items-start text-xs text-slate-500">
              <span className="font-semibold text-slate-700 mr-1.5">For:</span>
              <span className="truncate">{scheme.targetBeneficiaries}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="inline-flex items-center text-[11px] font-semibold text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#138808] mr-1" />
          Verified
        </span>

        <Link
          to={`/schemes/${scheme.slug || schemeId}`}
          className="inline-flex items-center text-xs font-bold text-[#123B69] hover:text-[#0B2545] group/btn"
        >
          <span>{t('popular.viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
