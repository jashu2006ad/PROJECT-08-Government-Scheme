import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { schemeService } from '../services/schemeService';
import { Sliders, CheckCircle2, AlertCircle, Play, Shield } from 'lucide-react';

export default function ManageEligibility() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Test Runner state
  const [testProfile, setTestProfile] = useState({
    age: 35,
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: 180000,
  });

  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await adminService.getSchemes();
        if (res.data) {
          setSchemes(res.data);
          if (res.data.length > 0) setSelectedScheme(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const handleRunTest = () => {
    if (!selectedScheme) return;
    const rule = selectedScheme.eligibility?.rule;
    if (!rule || !rule.conditions) {
      setTestResult({ status: 'PASS', message: 'General scheme with no restrictive rules.' });
      return;
    }

    const failed = [];
    const passed = [];

    for (const c of rule.conditions) {
      let isPass = false;
      const userVal = testProfile[c.field];
      if (userVal === undefined) {
        failed.push(`Missing field: ${c.field}`);
        continue;
      }

      if (c.operator === '==') isPass = String(userVal).toLowerCase() === String(c.value).toLowerCase();
      else if (c.operator === '>=') isPass = Number(userVal) >= Number(c.value);
      else if (c.operator === '<=') isPass = Number(userVal) <= Number(c.value);
      else if (c.operator === 'IN') {
        const arr = Array.isArray(c.value) ? c.value : [c.value];
        isPass = arr.map(x => String(x).toLowerCase()).includes(String(userVal).toLowerCase());
      } else {
        isPass = true;
      }

      if (isPass) passed.push(c.description || `${c.field} ${c.operator} ${c.value}`);
      else failed.push(c.description || `${c.field} ${c.operator} ${c.value}`);
    }

    if (failed.length === 0) {
      setTestResult({ status: 'PASS', passed, failed, message: 'All rule conditions satisfied!' });
    } else {
      setTestResult({ status: 'FAIL', passed, failed, message: 'One or more conditions failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-black text-slate-900">Rule Engine Configuration & Diagnostics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect AST rule tree structures, logical AND/OR conditions, and run real-time simulator tests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schemes List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Select Scheme</h3>
          {schemes.map((s) => (
            <button
              key={s.id || s._id}
              onClick={() => {
                setSelectedScheme(s);
                setTestResult(null);
              }}
              className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all ${
                (selectedScheme?.id || selectedScheme?._id) === (s.id || s._id)
                  ? 'bg-[#123B69] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {s.schemeName}
            </button>
          ))}
        </div>

        {/* Rule Inspector & Simulator */}
        <div className="lg:col-span-7 space-y-6">
          {selectedScheme && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedScheme.schemeName}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedScheme.eligibility?.summary}</p>
              </div>

              {/* AST JSON Preview */}
              <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                <pre>{JSON.stringify(selectedScheme.eligibility?.rule || { operator: 'AND', conditions: [] }, null, 2)}</pre>
              </div>

              {/* Simulator Inputs */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">Rule Simulator Parameters</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Test Age</label>
                    <input
                      type="number"
                      value={testProfile.age}
                      onChange={(e) => setTestProfile({ ...testProfile, age: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Test Annual Income (₹)</label>
                    <input
                      type="number"
                      value={testProfile.annualIncome}
                      onChange={(e) => setTestProfile({ ...testProfile, annualIncome: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Test Occupation</label>
                    <input
                      type="text"
                      value={testProfile.occupation}
                      onChange={(e) => setTestProfile({ ...testProfile, occupation: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunTest}
                  className="px-4 py-2 bg-[#123B69] hover:bg-[#0B2545] text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Rule Engine Test</span>
                </button>
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    testResult.status === 'PASS'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    {testResult.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#138808]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>Result: {testResult.message}</span>
                  </div>
                  {testResult.passed?.map((p, i) => (
                    <div key={i} className="text-emerald-700">✓ {p}</div>
                  ))}
                  {testResult.failed?.map((f, i) => (
                    <div key={i} className="text-rose-700">✗ {f}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
