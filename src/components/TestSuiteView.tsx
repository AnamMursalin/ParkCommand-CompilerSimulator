import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { runCompilerTests, type TestResult } from '../compiler/compiler.test';

export const TestSuiteView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runTests = () => {
    const results = runCompilerTests();
    setTestResults(results);
    setHasRun(true);
  };

  const getStatusBadge = (status: 'Passed' | 'Failed') => {
    if (status === 'Passed') {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
    }
    return 'bg-red-100 text-red-700 border border-red-300 animate-pulse';
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'Lexer': return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Parser': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      default: return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
    }
  };

  const passedCount = testResults.filter((r) => r.status === 'Passed').length;
  const failedCount = testResults.length - passedCount;

  return (
    <div className="flex flex-col gap-5 h-full bg-white rounded-xl border border-slate-700 p-5 font-sans">
      {/* Test Controls */}
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-300 pb-4">
        <div className="font-semibold text-slate-900 tracking-wide text-base">
          Automated Compiler Verification
        </div>
        <button
          onClick={runTests}
          className="flex items-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-400 text-slate-900 rounded-lg text-sm font-semibold transition-all active:scale-95"
        >
          <Play className="w-4.5 h-4.5" />
          Execute Test Suite
        </button>
      </div>

      {/* Test Outputs */}
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {!hasRun ? (
          <div className="py-10 text-center text-slate-600 font-medium text-base">
            Verification suite loaded. Click "Execute Test Suite" to run pipeline checks.
          </div>
        ) : (
          <div className="flex flex-col gap-4 font-mono text-sm">
            {/* Summary banner */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-300 flex justify-between items-center">
              <span className="text-slate-700 text-sm font-sans">Suite Run Summary:</span>
              <div className="flex gap-5">
                <span className="text-emerald-800 font-bold font-sans">
                  Passed: {passedCount}/{testResults.length}
                </span>
                {failedCount > 0 && (
                  <span className="text-red-800 font-bold font-sans">
                    Failed: {failedCount}
                  </span>
                )}
              </div>
            </div>

            {/* Test Cards */}
            {testResults.map((res, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-lg border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded text-sm font-bold uppercase tracking-tight ${getPhaseBadge(res.phase)}`}>
                      {res.phase}
                    </span>
                    <span className="text-slate-900 font-sans font-medium text-base">
                      {res.name}
                    </span>
                  </div>
                  {res.message && (
                    <div className="text-sm text-red-800 pl-3 mt-2 border-l-2 border-red-600 bg-red-50 py-1.5 pr-3 rounded">
                      {res.message}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 self-end sm:self-center">
                  <span className={`px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wider ${getStatusBadge(res.status)}`}>
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
