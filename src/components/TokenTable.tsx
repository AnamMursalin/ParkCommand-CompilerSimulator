import React from 'react';
import { Token } from '../compiler/lexer';

interface TokenTableProps {
  tokens: Token[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  const getTokenTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'KEYWORD':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'COMMAND':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'OBJECT':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'TYPE':
        return 'bg-teal-100 text-teal-700 border border-teal-300';
      case 'RELOP':
        return 'bg-pink-100 text-pink-700 border border-pink-300';
      case 'IDENTIFIER':
        return 'bg-slate-100 text-slate-700 border border-slate-300';
      case 'NUMBER':
        return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
      case 'EOF':
        return 'bg-slate-100 text-slate-500 border border-slate-300';
      default:
        return 'bg-red-100 text-red-700 border border-red-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto max-h-[350px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-800 text-sm font-semibold uppercase tracking-wider border-b border-slate-300">
              <th className="py-3.5 px-5 font-mono w-20">#</th>
              <th className="py-3.5 px-5">Token Type</th>
              <th className="py-3.5 px-5 font-mono">Value</th>
              <th className="py-3.5 px-5 font-mono w-32">Line No.</th>
              <th className="py-3.5 px-5 font-mono w-32">Col No.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-base">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-600 font-medium">
                  No tokens available. Compile code to see lexical tokens.
                </td>
              </tr>
            ) : (
              tokens.map((token, idx) => (
                <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5 font-mono text-slate-600 text-sm">{idx + 1}</td>
                  <td className="py-3 px-5">
                    <span className={`px-3 py-1.5 rounded text-sm font-bold font-mono uppercase tracking-tight ${getTokenTypeBadgeClass(token.type)}`}>
                      {token.type}
                    </span>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-900">{token.value}</td>
                  <td className="py-3 px-5 font-mono text-slate-600 text-sm">{token.line}</td>
                  <td className="py-3 px-5 font-mono text-slate-600 text-sm">{token.column}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
