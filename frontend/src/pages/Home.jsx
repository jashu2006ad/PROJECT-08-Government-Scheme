import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { schemeService } from '../services/schemeService';
import SchemeCard from '../components/cards/SchemeCard';
import {
  Search,
  CheckCircle,
  FileText,
  ExternalLink,
  ClipboardList,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Building,
  GraduationCap,
  HeartPulse,
  Sprout,
  Coins,
  Home as HomeIcon,
  Briefcase
} from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularSchemes, setPopularSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalSchemes: 10,
    availableCategories: 8,
    registeredCitizens: 2,
    applicationsRecorded: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schemesRes, catsRes, statsRes] = await Promise.all([
          schemeService.getSchemes({ limit: 6, sortBy: 'recent' }),
          schemeService.getCategories(),
          schemeService.getStats()
        ]);

        if (schemesRes?.data) setPopularSchemes(schemesRes.data);
        if (catsRes?.data) setCategories(catsRes.data);
        if (statsRes?.data) setStats(statsRes.data);
      } catch (err) {
        console.warn('Home data fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Sprout': return <Sprout className="w-6 h-6 text-emerald-600" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-rose-600" />;
      case 'Home': return <HomeIcon className="w-6 h-6 text-amber-600" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-indigo-600" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-orange-600" />;
      case 'Users': return <Users className="w-6 h-6 text-pink-600" />;
      default: return <Coins className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#123B69]/10 via-[#F5F7FA] to-[#F5F7FA] pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subtitle, Search, CTA Buttons */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-[#123B69]">
                <Sparkles className="w-4 h-4 text-[#FF9933]" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#123B69] tracking-tight leading-tight">
                {t('hero.title')}
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>

              {/* Action Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                <div className="relative flex items-center bg-white rounded-2xl border-2 border-[#123B69]/20 shadow-md p-2 focus-within:border-[#123B69] transition-all">
                  <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder')}
                    className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none pr-3"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#123B69] hover:bg-[#0B2545] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {t('hero.searchBtn')}
                  </button>
                </div>
              </form>

              {/* Main CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/schemes"
                  className="px-6 py-3.5 bg-[#123B69] hover:bg-[#0B2545] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center space-x-2"
                >
                  <span>{t('hero.exploreBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/eligibility"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#123B69] border-2 border-[#123B69] font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-[#138808]" />
                  <span>{t('hero.checkEligibilityBtn')}</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex items-center space-x-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-[#138808] mr-1.5" />
                  Verified Govt Sources
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-[#FF9933] mr-1.5" />
                  Rule-Based Engine
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 text-[#123B69] mr-1.5" />
                  Free Citizen Access
                </span>
              </div>
            </div>

            {/* Right Column: High Quality SVG Digital Citizen Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
                {/* Tricolour Accent in graphic */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF9933]/20 via-[#138808]/10 to-transparent rounded-bl-full pointer-events-none"></div>

                <svg viewBox="0 0 500 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  {/* Digital Device Backdrop */}
                  <rect x="50" y="40" width="400" height="340" rx="24" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="4"/>
                  <rect x="70" y="60" width="360" height="40" rx="8" fill="#123B69"/>
                  <circle cx="100" cy="80" r="6" fill="#FF9933"/>
                  <circle cx="120" cy="80" r="6" fill="#FFFFFF"/>
                  <circle cx="140" cy="80" r="6" fill="#138808"/>
                  <rect x="180" y="74" width="220" height="12" rx="6" fill="#FFFFFF" fillOpacity="0.2"/>

                  {/* Citizen Farmer / Student / Woman Vector Characters */}
                  {/* Farmer Figure */}
                  <circle cx="150" cy="180" r="30" fill="#FFE2C6"/>
                  <path d="M120 170 Q150 140 180 170 Z" fill="#FF9933"/>
                  <path d="M110 270 Q150 220 190 270 L190 310 L110 310 Z" fill="#2563EB"/>
                  <rect x="135" y="270" width="30" height="40" fill="#1D4ED8"/>

                  {/* Student Figure */}
                  <circle cx="260" cy="170" r="28" fill="#FCD3B6"/>
                  <path d="M232 155 L260 140 L288 155 L260 170 Z" fill="#1E293B"/>
                  <path d="M288 155 L292 180" stroke="#FF9933" strokeWidth="3"/>
                  <path d="M225 260 Q260 210 295 260 L295 310 L225 310 Z" fill="#0D9488"/>

                  {/* Woman Figure */}
                  <circle cx="360" cy="185" r="28" fill="#FED7AA"/>
                  <path d="M330 190 Q360 150 390 190 Z" fill="#BE123C"/>
                  <path d="M325 270 Q360 225 395 270 L395 310 L325 310 Z" fill="#E11D48"/>

                  {/* Digital Welfare Benefit Rays */}
                  <rect x="80" y="325" width="100" height="24" rx="6" fill="#DCFCE7"/>
                  <text x="92" y="341" fill="#166534" fontSize="12" fontWeight="bold">₹6,000 DBT</text>

                  <rect x="200" y="325" width="110" height="24" rx="6" fill="#DBEAFE"/>
                  <text x="210" y="341" fill="#1E40AF" fontSize="12" fontWeight="bold">Scholarship</text>

                  <rect x="330" y="325" width="90" height="24" rx="6" fill="#FEF3C7"/>
                  <text x="340" y="341" fill="#92400E" fontSize="12" fontWeight="bold">₹5L Health</text>
                </svg>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-700">Central & State Portals Connected</span>
                  </div>
                  <span className="text-xs font-bold text-[#123B69]">100% Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Government Schemes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#123B69] tracking-tight">
              {t('popular.title')}
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              {t('popular.subtitle')}
            </p>
          </div>
          <Link
            to="/schemes"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-[#123B69] hover:underline"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse p-6"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularSchemes.map((scheme) => (
              <SchemeCard key={scheme.id || scheme._id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Explore Categories */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#123B69] tracking-tight">
              {t('categories.title')}
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              {t('categories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat._id}
                to={`/schemes?categoryId=${cat.id || cat._id}`}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-[#123B69] border border-slate-200/80 hover:border-[#123B69] transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-white/10 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-white text-base mb-1 transition-colors">
                  {cat.categoryName}
                </h3>
                <p className="text-xs text-slate-500 group-hover:text-slate-200 line-clamp-2 leading-relaxed transition-colors">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works (5 Transparent Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF9933] block mb-2">
            Step-By-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-[#123B69] tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            {
              num: '01',
              title: t('howItWorks.step1Title'),
              desc: t('howItWorks.step1Desc'),
              icon: Search
            },
            {
              num: '02',
              title: t('howItWorks.step2Title'),
              desc: t('howItWorks.step2Desc'),
              icon: CheckCircle
            },
            {
              num: '03',
              title: t('howItWorks.step3Title'),
              desc: t('howItWorks.step3Desc'),
              icon: ClipboardList
            },
            {
              num: '04',
              title: t('howItWorks.step4Title'),
              desc: t('howItWorks.step4Desc'),
              icon: ExternalLink
            },
            {
              num: '05',
              title: t('howItWorks.step5Title'),
              desc: t('howItWorks.step5Desc'),
              icon: FileText
            }
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-[#FF9933]">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#123B69]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Live Database Statistics */}
      <section className="bg-[#123B69] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {t('stats.title')}
            </h2>
            <p className="text-slate-300 mt-2 text-sm">
              {t('stats.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="block text-4xl sm:text-5xl font-black text-[#FF9933] mb-2">
                {stats.totalSchemes}+
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {t('stats.totalSchemes')}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="block text-4xl sm:text-5xl font-black text-emerald-400 mb-2">
                {stats.availableCategories}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {t('stats.availableCategories')}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="block text-4xl sm:text-5xl font-black text-white mb-2">
                {stats.registeredCitizens}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {t('stats.registeredCitizens')}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="block text-4xl sm:text-5xl font-black text-amber-300 mb-2">
                {stats.applicationsRecorded}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {t('stats.applicationsRecorded')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose GovScheme? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-[#123B69] tracking-tight">
            {t('whyUs.title')}
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            {t('whyUs.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: t('whyUs.feature1Title'), desc: t('whyUs.feature1Desc') },
            { title: t('whyUs.feature2Title'), desc: t('whyUs.feature2Desc') },
            { title: t('whyUs.feature3Title'), desc: t('whyUs.feature3Desc') },
            { title: t('whyUs.feature4Title'), desc: t('whyUs.feature4Desc') },
            { title: t('whyUs.feature5Title'), desc: t('whyUs.feature5Desc') },
            { title: "Direct Citizen Tracking", desc: "Keep personal records of application reference numbers, notes, and milestones securely." }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
