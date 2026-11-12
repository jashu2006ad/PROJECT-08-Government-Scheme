import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import SchemeCard from '../components/cards/SchemeCard';
import { Bookmark, Inbox, ArrowLeft } from 'lucide-react';

export default function SavedSchemes() {
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await schemeService.getSavedSchemes();
      if (res.data) setSavedSchemes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (schemeId, isSaved) => {
    if (!isSaved) {
      setSavedSchemes((prev) => prev.filter((s) => (s.id || s._id) !== schemeId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#123B69]">Saved Schemes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Easily access and track your bookmarked government initiatives.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Bookmark className="w-5 h-5 fill-current" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse p-6"></div>
          ))}
        </div>
      ) : savedSchemes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Saved Schemes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            You haven't bookmarked any welfare schemes yet. Browse the portal and click the bookmark icon to save schemes for quick access.
          </p>
          <Link
            to="/schemes"
            className="px-5 py-2.5 bg-[#123B69] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Explore Schemes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id || scheme._id}
              scheme={scheme}
              isSavedInitially={true}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
