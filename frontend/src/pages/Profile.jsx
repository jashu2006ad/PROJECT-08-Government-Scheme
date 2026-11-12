import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function Profile() {
  const { user, updateUserProfile, logout } = useAuth();

  const [personalData, setPersonalData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    state: user?.state || 'Andhra Pradesh',
    district: user?.district || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalMsg, setPersonalMsg] = useState('');
  const [personalErr, setPersonalErr] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const indianStates = [
    'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi (NCT)'
  ];

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setPersonalLoading(true);
    setPersonalMsg('');
    setPersonalErr('');
    try {
      const res = await authService.updateProfile(personalData);
      if (res.data) {
        updateUserProfile(res.data);
        setPersonalMsg('Profile details successfully updated.');
      }
    } catch (err) {
      setPersonalErr(err.message || 'Failed to update profile.');
    } finally {
      setPersonalLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (passwordData.newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordErr(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your citizen account?')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/account`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('govscheme_token')}`,
          },
        });
        await logout();
      } catch (err) {
        alert('Could not deactivate account.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#123B69] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{user?.fullName}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800">
                {user?.role === 'admin' ? 'Administrator' : 'Citizen Account'}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Information Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-[#123B69]" />
          <span>Edit Personal Information</span>
        </div>

        {personalMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{personalMsg}</span>
          </div>
        )}

        {personalErr && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{personalErr}</span>
          </div>
        )}

        <form onSubmit={handlePersonalSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={personalData.fullName}
                onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                value={personalData.mobile}
                onChange={(e) => setPersonalData({ ...personalData, mobile: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                State of Residence
              </label>
              <select
                value={personalData.state}
                onChange={(e) => setPersonalData({ ...personalData, state: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white"
              >
                {indianStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                District
              </label>
              <input
                type="text"
                value={personalData.district}
                onChange={(e) => setPersonalData({ ...personalData, district: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={personalLoading}
            className="px-6 py-2.5 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            {personalLoading ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
          <KeyRound className="w-5 h-5 text-amber-600" />
          <span>Security: Change Password</span>
        </div>

        {passwordMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordErr && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordErr}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password *
            </label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone: Account Deactivation */}
      <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-rose-900 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Deactivate Citizen Account</span>
          </h3>
          <p className="text-xs text-rose-700 mt-1 max-w-lg">
            Deactivating will remove access to your saved schemes, bookmarks, and recorded application numbers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm self-start sm:self-auto"
        >
          Deactivate Account
        </button>
      </div>
    </div>
  );
}
