import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-xl">
        <span className="text-6xl font-black text-[#123B69] block mb-2">404</span>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The requested page or government scheme record does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Portal Home</span>
        </Link>
      </div>
    </div>
  );
}
