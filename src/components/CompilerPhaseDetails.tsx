import React from 'react';

interface CompilerPhaseDetailsProps {
  tokenCount: number;
  astNodeCount: number;
  symbolTableCount: number;
  irLineCount: number;
  simulationStepCount: number;
}

export const CompilerPhaseDetails: React.FC<CompilerPhaseDetailsProps> = ({
  tokenCount,
  astNodeCount,
  symbolTableCount,
  irLineCount,
  simulationStepCount,
}) => {
  const metrics = [
    { label: 'Tokens', value: tokenCount, color: 'text-cyan-700 border-cyan-300 bg-cyan-50' },
    { label: 'AST Nodes', value: astNodeCount, color: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
    { label: 'Symbols', value: symbolTableCount, color: 'text-amber-700 border-amber-300 bg-amber-50' },
    { label: 'IR Instructions', value: irLineCount, color: 'text-purple-700 border-purple-300 bg-purple-50' },
    { label: 'Sim Steps', value: simulationStepCount, color: 'text-rose-700 border-rose-300 bg-rose-50' },
  ];

  return (
    <div className="bg-white border border-slate-700 p-6 rounded-xl shadow-md w-full">
      <div className="text-xs text-slate-700 uppercase font-bold tracking-wider mb-4">
        Compiler Metrics & Phase Diagnostic Counts
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {metrics.map((m) => {
          return (
            <div
              key={m.label}
              className={`p-4 rounded-lg border flex items-center justify-center gap-3 transition-all duration-350 ${m.color}`}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">{m.label}</span>
                <span className="font-mono text-2xl font-extrabold text-slate-900 mt-1">{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
