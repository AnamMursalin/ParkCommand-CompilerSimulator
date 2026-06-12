import React from 'react';
import { AlertCircle, Terminal, HelpCircle, CheckCircle } from 'lucide-react';
import { CompilerError } from '../compiler/errors';

interface ErrorPanelProps {
  errors: CompilerError[];
  isCompiled: boolean;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ errors, isCompiled }) => {
  const getErrorTitle = (type: string) => {
    switch (type) {
      case 'lexical': return 'Lexical Error';
      case 'syntax': return 'Syntax Error';
      case 'semantic': return 'Semantic Error';
      default: return 'Error';
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'lexical': return 'text-red-400 border-red-900/40 bg-red-950/20';
      case 'syntax': return 'text-rose-400 border-rose-900/40 bg-rose-950/20';
      case 'semantic': return 'text-amber-400 border-amber-900/40 bg-amber-950/20';
      default: return 'text-red-400 border-red-900 bg-red-950/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg font-mono text-sm">
      {/* Panel Title */}
      <div className="flex items-center gap-2 p-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase font-bold tracking-wider">
        <Terminal className="w-4 h-4 text-rose-500" />
        <span>Compiler Diagnostic Logs</span>
      </div>

      {/* Diagnostics Output */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
        {errors.length === 0 ? (
          isCompiled ? (
            <div className="flex flex-col items-center justify-center py-6 text-emerald-450 gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <span className="font-semibold text-center text-sm">
                Compilation Successful: 0 errors detected.
              </span>
              <span className="text-xs text-slate-500 text-center font-sans">
                No lexical, syntax, or semantic anomalies found. Ready for simulator execution!
              </span>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 font-medium">
              Compiler status: Idle. Click "Compile" to scan the source code.
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {errors.map((err, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${getErrorColor(
                  err.type
                )}`}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-xs uppercase tracking-wider mb-0.5">
                    {getErrorTitle(err.type)} at Line {err.line}, Column {err.column}
                  </div>
                  <div className="text-slate-200 leading-5 text-sm">{err.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
