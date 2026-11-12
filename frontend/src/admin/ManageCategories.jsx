import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { schemeService } from '../services/schemeService';
import { FolderTree, Plus, Edit, Trash2, X, CheckCircle2 } from 'lucide-react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    icon: 'Folder',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await schemeService.getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '', icon: 'Folder' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      categoryName: cat.categoryName || '',
      description: cat.description || '',
      icon: cat.icon || 'Folder',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id || editingCategory._id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId) => {
    if (window.confirm('Are you sure you want to deactivate this category?')) {
      try {
        await adminService.deleteCategory(catId);
        fetchCategories();
      } catch (err) {
        alert('Failed to deactivate category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Welfare Categories</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize government initiatives into accessible public sectors.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="px-5 py-2.5 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id || cat._id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">{cat.categoryName}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => openEdit(cat)}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id || cat._id)}
                className="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="e.g. Healthcare"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of schemes under this sector"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                ></textarea>
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
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
