import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { eligibilityService } from '../services/eligibilityService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ClipboardList,
  ArrowRight
} from 'lucide-react';

export default function EligibilityChecker() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('eligible'); // eligible | potential | ineligible

  // Multi-step form state
  const [formData, setFormData] = useState({
    // Step 1: Personal
    age: user?.age || 25,
    gender: 'Male',
    state: user?.state || 'Andhra Pradesh',
    district: user?.district || '',

    // Step 2: Financial
    annualIncome: 180000,
    incomeCategory: 'Below ₹2.5 Lakhs (BPL/EWS)',

    // Step 3: Occupation
    occupation: 'Farmer',

    // Step 4: Additional
    education: 'Secondary School',
    socialCategory: 'OBC',
    disabilityStatus: 'No',
  });

  const indianStates = [
    'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi (NCT)'
  ];

  const occupationsList = [
    'Farmer',
    'Student',
    'Employed',
    'Unemployed',
    'Self-employed',
    'Artisan / Craftsperson',
    'Other'
  ];

  const socialCategories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'BPL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitEvaluation = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        state: formData.state,
        district: formData.district,
        annualIncome: parseFloat(formData.annualIncome),
        incomeCategory: formData.incomeCategory,
        occupation: formData.occupation,
        education: formData.education,
        socialCategory: formData.socialCategory,
        disabilityStatus: formData.disabilityStatus,
      };

      const res = await eligibilityService.checkEligibility(payload);
      if (res.data) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate eligibility rules.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setCurrentStep(1);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-[#138808]" />
          <span>Dynamic Rule Evaluation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#123B69] tracking-tight">
          {t('eligibilityForm.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          {t('eligibilityForm.subtitle')}
        </p>
      </div>

      {!results ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Step Progress Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep === step
                      ? 'bg-[#123B69] text-white shadow-sm'
                      : currentStep > step
                      ? 'bg-[#138808] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700">
                  {step === 1 && t('eligibilityForm.step1')}
                  {step === 2 && t('eligibilityForm.step2')}
                  {step === 3 && t('eligibilityForm.step3')}
                  {step === 4 && t('eligibilityForm.step4')}
                  {step === 5 && t('eligibilityForm.step5')}
                </span>
              </div>
            ))}
          </div>

          <div className="p-6 sm:p-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 1: {t('eligibilityForm.step1')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.age')} *
                    </label>
                    <input
                      type="number"
                      name="age"
                      min={1}
                      max={120}
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.gender')} *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none bg-white"
                    >
                      <option value="Male">{t('eligibilityForm.male')}</option>
                      <option value="Female">{t('eligibilityForm.female')}</option>
                      <option value="Other">{t('eligibilityForm.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.state')} *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none bg-white"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.district')}
                    </label>
                    <input
                      type="text"
                      name="district"
                      placeholder="e.g. Visakhapatnam / Guntur"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Financial Details */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 2: {t('eligibilityForm.step2')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.annualIncome')} *
                    </label>
                    <input
                      type="number"
                      name="annualIncome"
                      min={0}
                      step={5000}
                      value={formData.annualIncome}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Include combined annual earnings of all family members.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.incomeCategory')}
                    </label>
                    <select
                      name="incomeCategory"
                      value={formData.incomeCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none bg-white"
                    >
                      <option value="Below ₹1 Lakh (BPL)">Below ₹1 Lakh (BPL / Antyodaya)</option>
                      <option value="Below ₹2.5 Lakhs (BPL/EWS)">Below ₹2.5 Lakhs (EWS)</option>
                      <option value="₹2.5 Lakhs - ₹5 Lakhs (LIG)">₹2.5 Lakhs - ₹5 Lakhs (LIG)</option>
                      <option value="Above ₹5 Lakhs (MIG/HIG)">Above ₹5 Lakhs (Middle/Higher)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Occupation Details */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 3: {t('eligibilityForm.step3')}
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    {t('eligibilityForm.occupation')} *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {occupationsList.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setFormData({ ...formData, occupation: occ })}
                        className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          formData.occupation === occ
                            ? 'bg-[#123B69] text-white border-[#123B69] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 4: {t('eligibilityForm.step4')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.education')}
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none bg-white"
                    >
                      <option value="Primary School">Primary School (Up to 5th)</option>
                      <option value="Secondary School">Secondary School (10th/SSC)</option>
                      <option value="Higher Secondary">Higher Secondary (12th/Intermediate)</option>
                      <option value="College Student">College Student (Undergraduate/Diploma)</option>
                      <option value="Post Graduate">Post Graduate / Research</option>
                      <option value="No Formal Education">No Formal Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.socialCategory')}
                    </label>
                    <select
                      name="socialCategory"
                      value={formData.socialCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#123B69] text-sm outline-none bg-white"
                    >
                      {socialCategories.map((sc) => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('eligibilityForm.disabilityStatus')}
                    </label>
                    <div className="flex space-x-3">
                      {['No', 'Yes'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, disabilityStatus: opt })}
                          className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            formData.disabilityStatus === opt
                              ? 'bg-[#123B69] text-white border-[#123B69]'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {opt === 'Yes' ? t('eligibilityForm.yes') : t('eligibilityForm.no')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 5: Review Profile Information
                </h3>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Age</span>
                    <strong className="text-slate-800 text-sm">{formData.age} years</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Gender</span>
                    <strong className="text-slate-800 text-sm">{formData.gender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">State</span>
                    <strong className="text-slate-800 text-sm">{formData.state}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Occupation</span>
                    <strong className="text-slate-800 text-sm">{formData.occupation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Annual Family Income</span>
                    <strong className="text-slate-800 text-sm">₹{Number(formData.annualIncome).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Social Category</span>
                    <strong className="text-slate-800 text-sm">{formData.socialCategory}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <strong>Notice: </strong>
                  The engine will compare your inputs against the official statutory criteria of all active schemes. For logged-in citizens, these results are automatically saved in your personal dashboard history.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold shadow-sm flex items-center space-x-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitEvaluation}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#FF9933]" />
                  <span>{loading ? t('eligibilityForm.evaluating') : t('eligibilityForm.checkBtn')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Evaluation Results View */
        <div className="space-y-8 animate-in fade-in">
          {/* Summary Scorecard */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-[#123B69]">
                  {t('eligibilityForm.resultsTitle')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated across {results.totalEvaluated} government schemes using your entered profile parameters.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test New Demographics</span>
              </button>
            </div>

            {/* Metrics Breakdown Tabs */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <button
                type="button"
                onClick={() => setActiveTab('eligible')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  activeTab === 'eligible'
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block text-2xl sm:text-3xl font-black text-[#138808]">
                  {results.eligibleCount}
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  Eligible Schemes
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('potential')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  activeTab === 'potential'
                    ? 'bg-amber-50 border-amber-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block text-2xl sm:text-3xl font-black text-amber-600">
                  {results.potentialCount}
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  Needs More Info
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ineligible')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  activeTab === 'ineligible'
                    ? 'bg-rose-50 border-rose-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block text-2xl sm:text-3xl font-black text-slate-400">
                  {results.ineligibleCount}
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  Ineligible
                </span>
              </button>
            </div>
          </div>

          {/* Scheme Cards for Active Tab */}
          <div className="space-y-4">
            {activeTab === 'eligible' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#138808]" />
                  <span>{t('eligibilityForm.eligibleSection')} ({results.eligibleCount})</span>
                </h3>

                {results.eligibleSchemes.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-white p-6 rounded-2xl border border-slate-200">
                    No schemes completely match your exact parameters at this time. Check the 'Needs More Info' tab.
                  </p>
                ) : (
                  results.eligibleSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mr-2">
                            {scheme.categoryName}
                          </span>
                          <h4 className="text-lg font-bold text-[#123B69] mt-1">
                            {scheme.schemeName}
                          </h4>
                        </div>
                        <span className="inline-flex items-center text-xs font-bold text-[#138808] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                          ✓ You Are Eligible
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {scheme.benefits}
                      </p>

                      {/* Explanation of Satisfied Conditions */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                        <strong className="text-slate-800 block mb-1">Satisfied Official Conditions:</strong>
                        {scheme.matchedConditions?.map((c, i) => (
                          <div key={i} className="flex items-center space-x-2 text-slate-700">
                            <span className="text-[#138808] font-bold">✓</span>
                            <span>{c.description || c.message || JSON.stringify(c)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <Link
                          to={`/schemes/${scheme.slug || scheme.id}`}
                          className="text-xs font-bold text-[#123B69] hover:underline flex items-center space-x-1"
                        >
                          <span>View Complete Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/assistance/${scheme.slug || scheme.id}`}
                            className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1"
                          >
                            <ClipboardList className="w-3.5 h-3.5 mr-1" />
                            <span>Prepare Documents</span>
                          </Link>
                          {scheme.applicationUrl && (
                            <a
                              href={scheme.applicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-1.5 rounded-lg bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold flex items-center space-x-1"
                            >
                              <span>Apply Online</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'potential' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                  <span>{t('eligibilityForm.potentialSection')} ({results.potentialCount})</span>
                </h3>

                {results.potentiallyEligibleSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-slate-800">{scheme.schemeName}</h4>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                        Additional Information Needed
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{scheme.explanation}</p>

                    <div className="p-3 bg-amber-50/50 rounded-xl text-xs text-amber-900">
                      <strong>Missing verification fields: </strong>
                      {scheme.missingInformation?.map((m, i) => (
                        <span key={i} className="inline-block bg-white border border-amber-200 px-2 py-0.5 rounded mr-1.5 mt-1 font-semibold">
                          {m.field || m}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/schemes/${scheme.slug || scheme.id}`}
                      className="inline-flex items-center text-xs font-bold text-[#123B69] hover:underline pt-2"
                    >
                      <span>Check Scheme Guidelines</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ineligible' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <span>{t('eligibilityForm.ineligibleSection')} ({results.ineligibleCount})</span>
                </h3>

                {results.ineligibleSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 opacity-75 hover:opacity-100 transition-opacity space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-bold text-slate-700">{scheme.schemeName}</h4>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Criteria Not Met
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 font-medium">
                      {scheme.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
