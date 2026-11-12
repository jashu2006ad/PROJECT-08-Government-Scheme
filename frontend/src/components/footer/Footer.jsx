import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, ExternalLink, Heart, Globe, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0B2545] text-slate-300 pt-16 pb-8 border-t-4 border-[#FF9933]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-1.5 border border-[#FF9933]/50">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <circle cx="50" cy="50" r="46" fill="#123B69" stroke="#FF9933" strokeWidth="4"/>
                  <circle cx="50" cy="50" r="26" stroke="#FFFFFF" strokeWidth="2.5"/>
                  <circle cx="50" cy="50" r="7" fill="#FF9933"/>
                  <path d="M30 65 L50 32 L70 65 Z" fill="none" stroke="#138808" strokeWidth="4"/>
                  <rect x="22" y="69" width="56" height="4" rx="2" fill="#FFFFFF"/>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">GovScheme</span>
                <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF9933] text-[#0B2545]">
                  India
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Empowering Indian citizens by making welfare schemes discoverable, transparent, and accessible through intelligent eligibility matching and application guidance.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#FF9933]">
              <ShieldCheck className="w-4 h-4 text-[#138808]" />
              <span>Verified Official Information Sources</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-l-2 border-[#FF9933] pl-2.5">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/schemes" className="hover:text-white transition-colors">
                  {t('nav.explore')}
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition-colors">
                  {t('nav.eligibility')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Government Portals */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-l-2 border-[#138808] pl-2.5">
              Important Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition-colors group"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-500 group-hover:text-[#FF9933]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.mygov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition-colors group"
                >
                  <span>MyGov Citizen Engagement</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-500 group-hover:text-[#FF9933]" />
                </a>
              </li>
              <li>
                <a
                  href="https://dbtbharat.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition-colors group"
                >
                  <span>DBT Bharat Direct Benefits</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-500 group-hover:text-[#FF9933]" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition-colors group"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-500 group-hover:text-[#FF9933]" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition-colors group"
                >
                  <span>PM-KISAN Samman Nidhi</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-500 group-hover:text-[#FF9933]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 border-l-2 border-white pl-2.5">
              Assistance & Helpdesk
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Need assistance checking scheme requirements or preparing your application documents?
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FF9933]" />
                <span>support@govscheme.nic.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#138808]" />
                <span>1800-11-2026 (Toll Free)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed mb-8">
          <strong className="text-slate-200">Legal Disclaimer: </strong>
          {t('disclaimer')}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GovScheme. Built for Indian Citizen Welfare.</p>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <Link to="/about" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-400">Helpdesk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
