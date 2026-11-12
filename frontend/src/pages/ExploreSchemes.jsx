import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { schemeService } from '../services/schemeService';
import SchemeCard from '../components/cards/SchemeCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function ExploreSchemes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'all');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(searchParams.get('beneficiary') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recent');

  const beneficiariesList = [
    { label: 'All Beneficiaries', value: 'all' },
    { label: 'Farmers', value: 'Farmer' },
    { label: 'Students', value: 'Student' },
    { label: 'Women & Girls', value: 'Female' },
    { label: 'Senior Citizens', value: 'Senior' },
    { label: 'Youth & Unemployed', value: 'Unemployed' },
    { label: 'Artisans & Craftsmen', value: 'Artisan' },
    { label: 'Micro Entrepreneurs', value: 'Self-employed' },
  ];

  const statesList = [
    'All India', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu',
    'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Gujarat', 'Rajasthan'
  ];

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await schemeService.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.warn('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch schemes whenever filters or pagination change
  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          state: selectedState !== 'all' ? selectedState : undefined,
          beneficiary: selectedBeneficiary !== 'all' ? selectedBeneficiary : undefined,
          sortBy: sortBy,
        };

        const res = await schemeService.getSchemes(params);
        if (res.data) {
          setSchemes(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch schemes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [pagination.page, selectedCategory, selectedState, selectedBeneficiary, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Trigger re-fetch
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (search.trim()) p.set('search', search.trim());
      else p.delete('search');
      return p;
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedState('all');
    setSelectedBeneficiary('all');
    setSortBy('recent');
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-[#123B69] tracking-tight">
          Explore Government Welfare Schemes
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Discover verified central and state welfare initiatives with transparent criteria, benefit amounts, and direct application links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <Filter className="w-5 h-5 text-[#123B69]" />
                <span>Filter Schemes</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-[#123B69] flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-xs font-medium text-slate-800 bg-white outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Beneficiary Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Beneficiary Group
              </label>
              <select
                value={selectedBeneficiary}
                onChange={(e) => {
                  setSelectedBeneficiary(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-xs font-medium text-slate-800 bg-white outline-none"
              >
                {beneficiariesList.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Applicable State
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-xs font-medium text-slate-800 bg-white outline-none"
              >
                <option value="all">All India / Any State</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Schemes Content Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Search Bar & Sort Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by scheme name or keyword..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-[#123B69] text-xs text-slate-800 outline-none"
              />
            </form>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none"
              >
                <option value="recent">Recently Added/Updated</option>
                <option value="alpha_asc">Alphabetical (A - Z)</option>
                <option value="alpha_desc">Alphabetical (Z - A)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* Results Count Banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{schemes.length}</strong> of{' '}
              <strong className="text-slate-800">{pagination.total}</strong> government schemes
            </span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>

          {/* Schemes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse p-6"></div>
              ))}
            </div>
          ) : schemes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Schemes Match Your Criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Try clearing or adjusting your search keywords or broadening your category and beneficiary filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#123B69] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => (
                <SchemeCard key={scheme.id || scheme._id} scheme={scheme} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                type="button"
                disabled={!pagination.hasPrev}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPagination((p) => ({ ...p, page: num }))}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    pagination.page === num
                      ? 'bg-[#123B69] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={!pagination.hasNext}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
