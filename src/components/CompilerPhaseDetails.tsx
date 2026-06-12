import React from 'react';
import { Hash, Code, LayoutGrid, FileText, Play } from 'lucide-react';

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
    { label: 'Tokens', value: tokenCount, icon: Hash, color: 'text-cyan-400 border-cyan-950/45 bg-cyan-950/10' },
    { label: 'AST Nodes', value: astNodeCount, icon: Code, color: 'text-emerald-400 border-emerald-950/45 bg-emerald-950/10' },
    { label: 'Symbols', value: symbolTableCount, icon: LayoutGrid, color: 'text-amber-400 border-amber-950/45 bg-amber-950/10' },
    { label: 'IR Instructions', value: irLineCount, icon: FileText, color: 'text-purple-400 border-purple-950/45 bg-purple-950/10' },
    { label: 'Sim Steps', value: simulationStepCount, icon: Play, color: 'text-rose-400 border-rose-950/45 bg-rose-950/10' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md w-full">
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2.5 flex items-center gap-1.5">
        <span>Compiler Metrics & Phase Diagnostic Counts</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all duration-350 ${m.color}`}
            >
              <div className="p-1.5 rounded bg-slate-950/40">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{m.label}</span>
                <span className="font-mono text-sm font-extrabold text-slate-200 mt-0.5">{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
