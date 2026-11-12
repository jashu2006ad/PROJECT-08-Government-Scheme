import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { schemeService } from '../services/schemeService';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function ManageSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    schemeName: '',
    categoryId: '',
    description: '',
    benefits: '',
    targetBeneficiaries: '',
    applicationUrl: '',
    officialSourceUrl: '',
    applicableStates: 'All India',
    isActive: true,
    // Simple Rule attributes
    minAge: 18,
    maxAge: 60,
    maxIncome: 300000,
    occupation: 'Any',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schemesRes, catsRes] = await Promise.all([
        adminService.getSchemes(),
        schemeService.getCategories(),
      ]);
      if (schemesRes.data) setSchemes(schemesRes.data);
      if (catsRes.data) {
        setCategories(catsRes.data);
        if (catsRes.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catsRes.data[0].id || catsRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingScheme(null);
    setFormData({
      schemeName: '',
      categoryId: categories[0]?.id || categories[0]?._id || '',
      description: '',
      benefits: '',
      targetBeneficiaries: '',
      applicationUrl: '',
      officialSourceUrl: '',
      applicableStates: 'All India',
      isActive: true,
      minAge: 18,
      maxAge: 60,
      maxIncome: 300000,
      occupation: 'Any',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (scheme) => {
    setEditingScheme(scheme);
    setFormData({
      schemeName: scheme.schemeName || '',
      categoryId: scheme.categoryId || '',
      description: scheme.description || '',
      benefits: scheme.benefits || '',
      targetBeneficiaries: scheme.targetBeneficiaries || '',
      applicationUrl: scheme.applicationUrl || '',
      officialSourceUrl: scheme.officialSourceUrl || '',
      applicableStates: scheme.applicableStates?.join(', ') || 'All India',
      isActive: scheme.isActive ?? true,
      minAge: 18,
      maxAge: 60,
      maxIncome: 300000,
      occupation: 'Any',
    });
    setError('');
    setShowModal(true);
  };

  const handleToggleActive = async (scheme) => {
    const newStatus = !scheme.isActive;
    try {
      await adminService.updateScheme(scheme.id || scheme._id, { isActive: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update scheme status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.schemeName.trim()) {
      setError('Scheme name is required.');
      return;
    }

    setSaving(true);
    setError('');

    // Build AST rule
    const conditions = [];
    if (formData.minAge) {
      conditions.push({ field: 'age', operator: '>=', value: Number(formData.minAge), description: `Age must be at least ${formData.minAge}` });
    }
    if (formData.maxIncome) {
      conditions.push({ field: 'annualIncome', operator: '<=', value: Number(formData.maxIncome), description: `Income must not exceed ₹${formData.maxIncome}` });
    }
    if (formData.occupation && formData.occupation !== 'Any') {
      conditions.push({ field: 'occupation', operator: '==', value: formData.occupation, description: `Occupation must be ${formData.occupation}` });
    }

    const payload = {
      schemeName: formData.schemeName.trim(),
      categoryId: formData.categoryId,
      description: formData.description.trim(),
      benefits: formData.benefits.trim(),
      targetBeneficiaries: formData.targetBeneficiaries.trim(),
      applicationUrl: formData.applicationUrl.trim(),
      officialSourceUrl: formData.officialSourceUrl.trim(),
      applicableStates: formData.applicableStates.split(',').map((s) => s.trim()),
      isActive: formData.isActive,
      eligibility: {
        summary: `Standard criteria for ${formData.schemeName}`,
        rule: {
          operator: 'AND',
          conditions: conditions,
        },
      },
      requiredDocuments: [
        { name: 'Aadhaar Card', description: 'Mandatory identity proof', mandatory: true },
        { name: 'Bank Passbook', description: 'Bank account details for DBT', mandatory: true },
        { name: 'Income Certificate', description: 'Proof of family annual income', mandatory: true },
      ],
      applicationProcedure: [
        'Visit the official portal at ' + (formData.applicationUrl || 'official website'),
        'Complete registration and verification',
        'Upload required documents and submit application',
      ],
    };

    try {
      if (editingScheme) {
        await adminService.updateScheme(editingScheme.id || editingScheme._id, payload);
      } else {
        await adminService.createScheme(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Error saving scheme.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Welfare Schemes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish new government schemes, edit eligibility rules, or update official verification stamps.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Scheme</span>
        </button>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Scheme Name</th>
                <th className="p-4">Target Beneficiaries</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.map((s) => (
                <tr key={s.id || s._id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{s.schemeName}</span>
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs block">
                      /{s.slug}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">
                    {s.targetBeneficiaries || 'All Citizens'}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(s)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(s)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(s)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800"
                    >
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Scheme Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingScheme ? 'Edit Government Scheme' : 'Publish New Government Scheme'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Scheme Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schemeName}
                  onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                  placeholder="e.g. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Applicable States
                  </label>
                  <input
                    type="text"
                    value={formData.applicableStates}
                    onChange={(e) => setFormData({ ...formData, applicableStates: e.target.value })}
                    placeholder="All India or comma-separated states"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Key Benefit Summary *
                </label>
                <input
                  type="text"
                  required
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="e.g. ₹6,000 per year in 3 equal installments"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Beneficiaries
                </label>
                <input
                  type="text"
                  value={formData.targetBeneficiaries}
                  onChange={(e) => setFormData({ ...formData, targetBeneficiaries: e.target.value })}
                  placeholder="e.g. Small and Marginal Farmers"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Official Application URL
                  </label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Official Source URL
                  </label>
                  <input
                    type="url"
                    value={formData.officialSourceUrl}
                    onChange={(e) => setFormData({ ...formData, officialSourceUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Rule Builder Parameters */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block">Automated Rule Conditions</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Min Age</label>
                    <input
                      type="number"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Max Annual Income (₹)</label>
                    <input
                      type="number"
                      value={formData.maxIncome}
                      onChange={(e) => setFormData({ ...formData, maxIncome: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Occupation</label>
                    <select
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Any">Any Occupation</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Student">Student</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-employed">Self-employed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingScheme ? 'Save Changes' : 'Publish Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
