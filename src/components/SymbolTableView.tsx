import React from 'react';
import { SymbolTable } from '../compiler/symbolTable';

interface SymbolTableViewProps {
  symbolTable: SymbolTable;
}

export const SymbolTableView: React.FC<SymbolTableViewProps> = ({ symbolTable }) => {
  const rows = symbolTable.rows;

  return (
    <div className="flex flex-col gap-5 h-full bg-white text-slate-900 p-2">
      {/* Symbol Table Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">Active Zone</span>
          <span className="text-base font-bold text-cyan-700 mt-2 truncate">
            {symbolTable.zoneName || 'None'}
          </span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">Reserved Slots</span>
          <span className="text-base font-bold text-red-700 mt-2">
            {symbolTable.reservedSlots.size > 0 
              ? Array.from(symbolTable.reservedSlots).join(', ') 
              : 'None'}
          </span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">Last Gate Status</span>
          <span className={`text-base font-bold mt-2 uppercase ${
            symbolTable.gateStatus === 'open' ? 'text-emerald-700' : 'text-slate-600'
          }`}>
            {symbolTable.gateStatus.toUpperCase()}
          </span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">Total Sensor Checks</span>
          <span className="text-base font-bold text-yellow-700 mt-2">
            {symbolTable.sensorCheckCount} check{symbolTable.sensorCheckCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Raw Table */}
      <div className="bg-slate-50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-y-auto max-h-[250px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-sm font-semibold uppercase tracking-wider border-b border-slate-300">
                <th className="py-3.5 px-5">Symbol / Key</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5 font-mono">Status Value</th>
                <th className="py-3.5 px-5 text-right">Updated Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-base font-mono">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-600 font-medium">
                    Symbol table is empty. Compile code to populate.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-100 transition-colors">
                    <td className="py-3 px-5 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-tight ${
                        row.type === 'Zone' ? 'bg-cyan-100 text-cyan-700' :
                        row.type === 'Slot' ? 'bg-indigo-100 text-indigo-700' :
                        row.type === 'Gate' ? 'bg-emerald-100 text-emerald-700' :
                        row.type === 'Sensor' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-700">{row.value}</td>
                    <td className="py-3 px-5 text-right text-slate-600 text-sm">Line {row.line}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
