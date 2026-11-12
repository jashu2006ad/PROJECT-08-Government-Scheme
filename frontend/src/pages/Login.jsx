import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please provide your registered email/mobile and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login({
        identifier: identifier.trim(),
        password: password,
      });

      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your login details.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const fillDemo = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-[#138808]" />
            <span>Secure Digital Identity</span>
          </div>
          <h2 className="text-3xl font-black text-[#123B69] tracking-tight">Citizen Login</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your saved schemes, eligibility evaluations, and application tracking.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Mobile */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email or Mobile Number
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              placeholder="e.g. citizen@govscheme.in or mobile"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] focus:ring-2 focus:ring-[#123B69]/10 text-sm outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 focus:border-[#123B69] focus:ring-2 focus:ring-[#123B69]/10 text-sm outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#123B69] hover:bg-[#0B2545] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Credentials Quick Click */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 mb-2.5 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933] mr-1" />
            Quick Test Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('citizen@govscheme.in', 'Citizen@12345')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            >
              Demo Citizen
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@govscheme.nic.in', 'Admin@12345')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-colors"
            >
              Portal Admin
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#123B69] hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
