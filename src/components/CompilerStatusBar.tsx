import React from 'react';
import { Cpu, ShieldCheck, CheckSquare, Settings2, ShieldX } from 'lucide-react';

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
    if (compileState === 'idle') return { label: 'Idle', color: 'bg-slate-800 text-slate-400 border-slate-700/50' };

    switch (phase) {
      case 'lexer':
        if (compileState === 'lexical') return { label: 'Scanning...', color: 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse font-bold' };
        if (failedPhase === 'lexer') return { label: 'Failed', color: 'bg-red-950 text-red-400 border-red-900 font-bold' };
        return { label: 'Passed', color: 'bg-emerald-950 text-emerald-400 border-emerald-900 font-bold' };

      case 'parser':
        if (compileState === 'lexical') return { label: 'Idle', color: 'bg-slate-800 text-slate-400 border-slate-700/50' };
        if (compileState === 'syntax') return { label: 'Parsing...', color: 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse font-bold' };
        if (failedPhase === 'lexer') return { label: 'Blocked', color: 'bg-slate-900 text-slate-600 border-slate-800' };
        if (failedPhase === 'parser') return { label: 'Failed', color: 'bg-red-950 text-red-400 border-red-900 font-bold' };
        return { label: 'Passed', color: 'bg-emerald-950 text-emerald-400 border-emerald-900 font-bold' };

      case 'semantic':
        if (compileState === 'lexical' || compileState === 'syntax') return { label: 'Idle', color: 'bg-slate-800 text-slate-400 border-slate-700/50' };
        if (compileState === 'semantic') return { label: 'Analyzing...', color: 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse font-bold' };
        if (failedPhase === 'lexer' || failedPhase === 'parser') return { label: 'Blocked', color: 'bg-slate-900 text-slate-600 border-slate-800' };
        if (failedPhase === 'semantic') return { label: 'Failed', color: 'bg-red-950 text-red-400 border-red-900 font-bold' };
        return { label: 'Passed', color: 'bg-emerald-950 text-emerald-400 border-emerald-900 font-bold' };

      case 'ir':
        if (compileState === 'lexical' || compileState === 'syntax' || compileState === 'semantic') {
          return { label: 'Idle', color: 'bg-slate-800 text-slate-400 border-slate-700/50' };
        }
        if (compileState === 'ir') return { label: 'Generating...', color: 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse font-bold' };
        if (failedPhase !== null) return { label: 'Not Generated', color: 'bg-slate-900 text-slate-600 border-slate-800' };
        return { label: 'Generated', color: 'bg-purple-950 text-purple-400 border-purple-900 font-bold' };
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
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Compiler Progress Bar */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Compiler Pipeline Status
          </span>
          <span className="font-mono text-cyan-400 font-bold">
            {compileState === 'success' ? '100% COMPLETE' : compileState === 'failed' ? 'COMPILATION FAILURE' : `${getProgressPercentage()}%`}
          </span>
        </div>
        {/* Loading track */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
          <div
            style={{ width: `${getProgressPercentage()}%` }}
            className={`h-full transition-all duration-300 rounded-full ${
              compileState === 'failed' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
            }`}
          />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Lexer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800/60 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lexer:</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold font-mono tracking-wide ${lexerStatus.color}`}>
            {lexerStatus.label}
          </span>
        </div>

        {/* Parser */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800/60 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Parser:</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold font-mono tracking-wide ${parserStatus.color}`}>
            {parserStatus.label}
          </span>
        </div>

        {/* Semantic */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800/60 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Semantics:</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold font-mono tracking-wide ${semanticStatus.color}`}>
            {semanticStatus.label}
          </span>
        </div>

        {/* IR Generator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800/60 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IR Code:</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold font-mono tracking-wide ${irStatus.color}`}>
            {irStatus.label}
          </span>
        </div>

        {/* Master Output Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800/60 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Build:</span>
          {compileState === 'success' ? (
            <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-900 bg-emerald-950 text-emerald-400 uppercase font-bold tracking-wider animate-bounce flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ready
            </span>
          ) : compileState === 'failed' ? (
            <span className="text-[10px] px-2 py-0.5 rounded border border-red-900 bg-red-950 text-red-400 uppercase font-bold tracking-wider flex items-center gap-1">
              <ShieldX className="w-3.5 h-3.5" />
              Blocked ({errorMessageCount})
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-500 uppercase font-bold tracking-wider">
              Idle
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
