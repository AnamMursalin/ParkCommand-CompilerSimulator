import React from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';

export type CompileProgressState = 'idle' | 'lexical' | 'syntax' | 'semantic' | 'ir' | 'success' | 'failed';

interface CompilerStatusBarProps {
  compileState: CompileProgressState;
  failedPhase: 'lexer' | 'parser' | 'semantic' | null;
  errorMessageCount: number;
}

export const CompilerStatusBar: React.FC<CompilerStatusBarProps> = ({
  compileState,
  failedPhase,
  errorMessageCount,
}) => {
  const getPhaseStatus = (phase: 'lexer' | 'parser' | 'semantic' | 'ir') => {
    if (compileState === 'idle') return { label: 'Idle', color: 'bg-slate-100 text-slate-600 border-slate-200' };

    switch (phase) {
      case 'lexer':
        if (compileState === 'lexical') return { label: 'Scanning...', color: 'bg-cyan-50 text-cyan-600 border-cyan-200 animate-pulse font-bold' };
        if (failedPhase === 'lexer') return { label: 'Failed', color: 'bg-red-50 text-red-600 border-red-200 font-bold' };
        return { label: 'Passed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' };

      case 'parser':
        if (compileState === 'lexical') return { label: 'Idle', color: 'bg-slate-100 text-slate-600 border-slate-200' };
        if (compileState === 'syntax') return { label: 'Parsing...', color: 'bg-cyan-50 text-cyan-600 border-cyan-200 animate-pulse font-bold' };
        if (failedPhase === 'lexer') return { label: 'Blocked', color: 'bg-slate-100 text-slate-500 border-slate-200' };
        if (failedPhase === 'parser') return { label: 'Failed', color: 'bg-red-50 text-red-600 border-red-200 font-bold' };
        return { label: 'Passed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' };

      case 'semantic':
        if (compileState === 'lexical' || compileState === 'syntax') return { label: 'Idle', color: 'bg-slate-100 text-slate-600 border-slate-200' };
        if (compileState === 'semantic') return { label: 'Analyzing...', color: 'bg-cyan-50 text-cyan-600 border-cyan-200 animate-pulse font-bold' };
        if (failedPhase === 'lexer' || failedPhase === 'parser') return { label: 'Blocked', color: 'bg-slate-100 text-slate-500 border-slate-200' };
        if (failedPhase === 'semantic') return { label: 'Failed', color: 'bg-red-50 text-red-600 border-red-200 font-bold' };
        return { label: 'Passed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' };

      case 'ir':
        if (compileState === 'lexical' || compileState === 'syntax' || compileState === 'semantic') {
          return { label: 'Idle', color: 'bg-slate-100 text-slate-600 border-slate-200' };
        }
        if (compileState === 'ir') return { label: 'Generating...', color: 'bg-cyan-50 text-cyan-600 border-cyan-200 animate-pulse font-bold' };
        if (failedPhase !== null) return { label: 'Not Generated', color: 'bg-slate-100 text-slate-500 border-slate-200' };
        return { label: 'Generated', color: 'bg-purple-50 text-purple-600 border-purple-200 font-bold' };
    }
  };

  const getProgressPercentage = () => {
    switch (compileState) {
      case 'idle': return 0;
      case 'lexical': return 20;
      case 'syntax': return 45;
      case 'semantic': return 70;
      case 'ir': return 90;
      case 'success': return 100;
      case 'failed': return failedPhase === 'lexer' ? 20 : failedPhase === 'parser' ? 45 : 70;
      default: return 0;
    }
  };

  const lexerStatus = getPhaseStatus('lexer');
  const parserStatus = getPhaseStatus('parser');
  const semanticStatus = getPhaseStatus('semantic');
  const irStatus = getPhaseStatus('ir');

  return (
    <div className="bg-white border border-slate-700 p-6 rounded-xl shadow-sm w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Compiler Progress Bar */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-700 font-semibold">
            Compiler Pipeline Status
          </span>
          <span className="font-mono text-cyan-700 font-bold text-base">
            {compileState === 'success' ? '100% COMPLETE' : compileState === 'failed' ? 'COMPILATION FAILURE' : `${getProgressPercentage()}%`}
          </span>
        </div>
        {/* Loading track */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-300">
          <div
            style={{ width: `${getProgressPercentage()}%` }}
            className={`h-full transition-all duration-300 rounded-full ${
              compileState === 'failed' ? 'bg-red-600' : 'bg-cyan-600'
            }`}
          />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Lexer */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Lexer:</span>
          <span className={`text-xs px-3 py-1 rounded border uppercase font-bold font-mono tracking-wide ${lexerStatus.color}`}>
            {lexerStatus.label}
          </span>
        </div>

        {/* Parser */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Parser:</span>
          <span className={`text-xs px-3 py-1 rounded border uppercase font-bold font-mono tracking-wide ${parserStatus.color}`}>
            {parserStatus.label}
          </span>
        </div>

        {/* Semantic */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Semantics:</span>
          <span className={`text-xs px-3 py-1 rounded border uppercase font-bold font-mono tracking-wide ${semanticStatus.color}`}>
            {semanticStatus.label}
          </span>
        </div>

        {/* IR Generator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">IR Code:</span>
          <span className={`text-xs px-3 py-1 rounded border uppercase font-bold font-mono tracking-wide ${irStatus.color}`}>
            {irStatus.label}
          </span>
        </div>

        {/* Master Output Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Build:</span>
          {compileState === 'success' ? (
            <span className="text-xs px-3 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 uppercase font-bold tracking-wider animate-bounce flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Ready
            </span>
          ) : compileState === 'failed' ? (
            <span className="text-xs px-3 py-1 rounded border border-red-300 bg-red-50 text-red-700 uppercase font-bold tracking-wider flex items-center gap-1">
              <ShieldX className="w-4 h-4" />
              Blocked ({errorMessageCount})
            </span>
          ) : (
            <span className="text-xs px-3 py-1 rounded border border-slate-300 bg-slate-100 text-slate-700 uppercase font-bold tracking-wider">
              Idle
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
