import React from 'react';
import { Token } from '../compiler/lexer';

interface TokenTableProps {
  tokens: Token[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  const getTokenTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'KEYWORD':
        return 'bg-blue-950/60 text-blue-400 border border-blue-800/40';
      case 'COMMAND':
        return 'bg-purple-950/60 text-purple-400 border border-purple-800/40';
      case 'OBJECT':
        return 'bg-amber-950/60 text-amber-400 border border-amber-800/40';
      case 'TYPE':
        return 'bg-teal-950/60 text-teal-400 border border-teal-800/40';
      case 'RELOP':
        return 'bg-pink-950/60 text-pink-400 border border-pink-800/40';
      case 'IDENTIFIER':
        return 'bg-slate-800 text-slate-300 border border-slate-700';
      case 'NUMBER':
        return 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40';
      case 'EOF':
        return 'bg-slate-900 text-slate-500 border border-slate-800';
      default:
        return 'bg-red-950/60 text-red-400 border border-red-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto max-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-850">
              <th className="py-2.5 px-4 font-mono w-16">#</th>
              <th className="py-2.5 px-4">Token Type</th>
              <th className="py-2.5 px-4 font-mono">Value</th>
              <th className="py-2.5 px-4 font-mono w-24">Line No.</th>
              <th className="py-2.5 px-4 font-mono w-24">Col No.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-sm">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                  No tokens available. Compile code to see lexical tokens.
                </td>
              </tr>
            ) : (
              tokens.map((token, idx) => (
                <tr key={token.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-2 px-4 font-mono text-slate-500 text-xs">{idx + 1}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-tight ${getTokenTypeBadgeClass(token.type)}`}>
                      {token.type}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-mono text-slate-200">{token.value}</td>
                  <td className="py-2 px-4 font-mono text-slate-400 text-xs">{token.line}</td>
                  <td className="py-2 px-4 font-mono text-slate-400 text-xs">{token.column}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
