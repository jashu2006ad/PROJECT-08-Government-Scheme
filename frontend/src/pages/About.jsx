import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Users, HeartHandshake, Sparkles, Building2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
          <Sparkles className="w-4 h-4 text-[#FF9933]" />
          <span>About GovScheme Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#123B69] tracking-tight">
          Bridging the Gap Between Citizens and Government Welfare
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          GovScheme is an independent citizen-first digital awareness and assistance platform designed to ensure every eligible Indian citizen discovers, understands, and accesses their rightful welfare entitlements.
        </p>
      </div>

      {/* The Problem & Our Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900">The Challenge We Solve</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In India, information regarding welfare schemes is scattered across hundreds of central and state departmental websites. Citizens frequently struggle with complex eligibility criteria, lack clarity on mandatory document requirements, or fall victim to deceptive middlemen.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Digital Solution</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We provide a single unified interface powered by a deterministic, rule-based eligibility evaluation engine. Citizens enter simple demographic information to receive instantaneous, transparent explanations of their eligibility and direct links to official government application portals.
          </p>
        </div>
      </div>

      {/* Target Beneficiaries Supported */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-[#123B69]">Who We Support</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          {[
            'Farmers & Agricultural Workers',
            'College & Higher Secondary Students',
            'Women & Girl Children',
            'Senior Citizens (60+ & 70+)',
            'Youth & Unemployed Citizens',
            'Economically Weaker Sections (EWS)',
            'Traditional Artisans & Craftspeople',
            'Persons with Disabilities (PwD)'
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#138808]"></span>
              <span className="text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guiding Principles */}
      <div className="bg-gradient-to-r from-[#123B69] to-[#0B2545] rounded-3xl p-8 text-white space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold">Our Core Commitments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs pt-2">
          <div>
            <strong className="text-[#FF9933] block text-sm mb-1">100% Free Access</strong>
            <p className="text-slate-300 leading-relaxed">
              GovScheme does not charge any citizen fees or demand financial information.
            </p>
          </div>
          <div>
            <strong className="text-[#FF9933] block text-sm mb-1">Verified Official Sources</strong>
            <p className="text-slate-300 leading-relaxed">
              Every scheme rule, document requirement, and URL is verified against official government gazettes.
            </p>
          </div>
          <div>
            <strong className="text-[#FF9933] block text-sm mb-1">Bilingual Inclusivity</strong>
            <p className="text-slate-300 leading-relaxed">
              Complete seamless language switching between English and Telugu for grassroot accessibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
