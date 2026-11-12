import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Menu,
  X,
  Globe,
  User,
  LogOut,
  Bookmark,
  FileText,
  Shield,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.explore'), path: '/schemes' },
    { name: t('nav.categories'), path: '/categories' },
    { name: t('nav.eligibility'), path: '/eligibility' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Tricolour Accent Line */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Portal Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-[#123B69] flex items-center justify-center p-2 shadow-md group-hover:scale-105 transition-transform duration-200">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <circle cx="50" cy="50" r="46" fill="#123B69" stroke="#FF9933" strokeWidth="4"/>
                <circle cx="50" cy="50" r="26" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="4 3"/>
                <circle cx="50" cy="50" r="7" fill="#FF9933"/>
                <path d="M30 65 L50 32 L70 65 Z" fill="none" stroke="#138808" strokeWidth="4" strokeLinejoin="round"/>
                <rect x="22" y="69" width="56" height="4" rx="2" fill="#FFFFFF"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black text-[#123B69] tracking-tight">GovScheme</span>
                <span className="text-xs px-2 py-0.5 font-bold uppercase rounded bg-[#FF9933]/15 text-[#123B69] border border-[#FF9933]/30">
                  India
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                National Welfare Awareness & Assistance Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                  isActive(link.path)
                    ? 'text-[#123B69] bg-slate-100/80 font-bold'
                    : 'text-slate-600 hover:text-[#123B69] hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section: Language Selector + Auth */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Language Selector Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-all ${
                  language === 'en'
                    ? 'bg-white text-[#123B69] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2 py-1 rounded transition-all ${
                  language === 'te'
                    ? 'bg-white text-[#123B69] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Auth Buttons or User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#123B69] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName}</p>
                      <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {user?.role === 'admin' ? 'Administrator' : 'Citizen'}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#123B69]"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-500" />
                      {t('nav.dashboard')}
                    </Link>

                    <Link
                      to="/saved-schemes"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#123B69]"
                    >
                      <Bookmark className="w-4 h-4 mr-2.5 text-slate-500" />
                      {t('nav.savedSchemes')}
                    </Link>

                    <Link
                      to="/my-applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#123B69]"
                    >
                      <FileText className="w-4 h-4 mr-2.5 text-slate-500" />
                      {t('nav.myApplications')}
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#123B69]"
                    >
                      <User className="w-4 h-4 mr-2.5 text-slate-500" />
                      {t('nav.profile')}
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                      >
                        <Shield className="w-4 h-4 mr-2.5 text-amber-600" />
                        {t('nav.admin')}
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2.5 text-red-500" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#123B69] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-[#123B69] hover:bg-[#0B2545] rounded-lg shadow-sm hover:shadow transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-[#123B69] hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
          {/* Language Switcher on mobile */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Language / భాష:</span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  language === 'en' ? 'bg-[#123B69] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  language === 'te' ? 'bg-[#123B69] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                  isActive(link.path)
                    ? 'bg-slate-100 text-[#123B69]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 text-sm font-bold text-slate-800">
                Hi, {user?.fullName}
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/saved-schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t('nav.savedSchemes')}
              </Link>
              <Link
                to="/my-applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t('nav.myApplications')}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded"
              >
                {t('nav.profile')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-amber-700 font-semibold hover:bg-amber-50 rounded"
                >
                  {t('nav.admin')}
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold border border-[#123B69] text-[#123B69] rounded-lg"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold bg-[#123B69] text-white rounded-lg shadow-sm"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
