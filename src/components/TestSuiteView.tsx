import React, { useState } from 'react';
import { Play, CheckSquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import { runCompilerTests, TestResult } from '../compiler/compiler.test';

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
      return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40';
    }
    return 'bg-red-950/80 text-red-400 border border-red-800/40 animate-pulse';
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'Lexer': return 'bg-blue-950/50 text-blue-400 border border-blue-900/30';
      case 'Parser': return 'bg-yellow-950/50 text-yellow-400 border border-yellow-900/30';
      default: return 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/30';
    }
  };

  const passedCount = testResults.filter((r) => r.status === 'Passed').length;
  const failedCount = testResults.length - passedCount;

  return (
    <div className="flex flex-col gap-4 h-full bg-slate-900/40 rounded-xl border border-slate-800 p-4 font-sans">
      {/* Test Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-slate-200 tracking-wide text-sm">Automated Compiler Verification</span>
        </div>
        <button
          onClick={runTests}
          className="flex items-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all active:scale-95"
        >
          <Play className="w-3.5 h-3.5" />
          Execute Test Suite
        </button>
      </div>

      {/* Test Outputs */}
      <div className="flex-1 overflow-y-auto max-h-[250px]">
        {!hasRun ? (
          <div className="py-8 text-center text-slate-500 font-medium text-sm">
            Verification suite loaded. Click "Execute Test Suite" to run pipeline checks.
          </div>
        ) : (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Summary banner */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 text-xs font-sans">Suite Run Summary:</span>
              <div className="flex gap-4">
                <span className="text-emerald-400 font-bold font-sans">
                  Passed: {passedCount}/{testResults.length}
                </span>
                {failedCount > 0 && (
                  <span className="text-red-400 font-bold font-sans">
                    Failed: {failedCount}
                  </span>
                )}
              </div>
            </div>

            {/* Test Cards */}
            {testResults.map((res, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${getPhaseBadge(res.phase)}`}>
                      {res.phase}
                    </span>
                    <span className="text-slate-200 font-sans font-medium text-sm">
                      {res.name}
                    </span>
                  </div>
                  {res.message && (
                    <div className="text-[11px] text-red-400 pl-2 mt-1 border-l-2 border-red-500 bg-red-950/15 py-0.5 pr-2 rounded">
                      {res.message}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 self-end sm:self-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(res.status)}`}>
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
