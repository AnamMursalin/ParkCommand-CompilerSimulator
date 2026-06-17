import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { CompilerError } from '../compiler/errors';

interface DiagnosticsPanelProps {
  errors: CompilerError[];
  isCompiled: boolean;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ errors, isCompiled }) => {
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
      case 'lexical': return 'text-red-700 border-red-200 bg-red-50';
      case 'syntax': return 'text-rose-700 border-rose-200 bg-rose-50';
      case 'semantic': return 'text-amber-700 border-amber-200 bg-amber-50';
      default: return 'text-red-700 border-red-200 bg-red-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-700 rounded-xl overflow-hidden shadow-lg font-mono text-base">
      {/* Panel Title */}
      <div className="p-4 bg-slate-50 border-b border-slate-300 text-sm text-slate-800 uppercase font-bold tracking-wider">
        Compiler Diagnostic Logs
      </div>

      {/* Diagnostics Output */}
      <div className="p-5 flex-1 overflow-y-auto max-h-[350px]">
        {errors.length === 0 ? (
          isCompiled ? (
            <div className="flex flex-col items-center justify-center py-8 text-emerald-800 gap-3">
              <CheckCircle className="w-10 h-10 text-emerald-700" />
              <span className="font-semibold text-center text-base">
                Compilation Successful: 0 errors detected.
              </span>
              <span className="text-sm text-slate-600 text-center font-sans">
                No lexical, syntax, or semantic anomalies found. Ready for simulator execution!
              </span>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-600 font-medium">
              Compiler status: Idle. Click "Compile" to scan the source code.
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4">
            {errors.map((err, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border flex items-start gap-4 transition-colors ${getErrorColor(
                  err.type
                )}`}
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-bold text-sm uppercase tracking-wider mb-1">
                    {getErrorTitle(err.type)} at Line {err.line}, Column {err.column}
                  </div>
                  <div className="text-slate-900 leading-6 text-base">{err.message}</div>
                  {(err.badToken || err.expected || err.suggestion) && (
                    <div className="mt-3 pt-3 border-t border-slate-300 text-sm flex flex-col gap-2 text-slate-700">
                      {err.badToken && (
                        <div>
                          <span className="text-slate-600 font-semibold uppercase tracking-wider">Bad Token:</span>{' '}
                          <code className="bg-slate-100 px-2 py-1 rounded text-rose-800 font-bold">{err.badToken}</code>
                        </div>
                      )}
                      {err.expected && (
                        <div>
                          <span className="text-slate-600 font-semibold uppercase tracking-wider">Expected:</span>{' '}
                          <code className="bg-slate-100 px-2 py-1 rounded text-cyan-800 font-bold">{err.expected}</code>
                        </div>
                      )}
                      {err.suggestion && (
                        <div>
                          <span className="text-slate-600 font-semibold uppercase tracking-wider">Suggestion:</span>{' '}
                          <span className="text-slate-800 font-medium">{err.suggestion}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
