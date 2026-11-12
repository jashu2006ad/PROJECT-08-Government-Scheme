import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import {
  Sprout,
  HeartPulse,
  Home as HomeIcon,
  GraduationCap,
  Briefcase,
  Users,
  Coins,
  Shield,
  ArrowRight
} from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await schemeService.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-8 h-8 text-emerald-600" />;
      case 'HeartPulse': return <HeartPulse className="w-8 h-8 text-rose-600" />;
      case 'Home': return <HomeIcon className="w-8 h-8 text-amber-600" />;
      case 'GraduationCap': return <GraduationCap className="w-8 h-8 text-indigo-600" />;
      case 'Briefcase': return <Briefcase className="w-8 h-8 text-orange-600" />;
      case 'Users': return <Users className="w-8 h-8 text-pink-600" />;
      case 'ShieldCheck': return <Shield className="w-8 h-8 text-teal-600" />;
      default: return <Coins className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-[#123B69] tracking-tight">
          Welfare Scheme Categories
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Discover central and state government public welfare initiatives organized by socio-economic sector.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 animate-pulse p-6"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat._id}
              to={`/schemes?categoryId=${cat.id || cat._id}`}
              className="group p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#123B69] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-[#123B69]/5 flex items-center justify-center mb-4 transition-colors">
                  {getIcon(cat.icon)}
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#123B69] transition-colors mb-2">
                  {cat.categoryName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#123B69]">
                <span>Browse Category Schemes</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
