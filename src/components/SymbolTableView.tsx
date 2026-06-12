import React from 'react';
import { Shield, Eye, BookmarkCheck, SlidersHorizontal } from 'lucide-react';
import { SymbolTable } from '../compiler/symbolTable';

interface SymbolTableViewProps {
  symbolTable: SymbolTable;
}

export const SymbolTableView: React.FC<SymbolTableViewProps> = ({ symbolTable }) => {
  const rows = symbolTable.rows;

  return (
    <div className="flex flex-col gap-4 h-full bg-slate-900/10 text-slate-100 p-1">
      {/* Symbol Table Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Zone</span>
          <span className="text-sm font-bold text-cyan-400 mt-1 truncate">
            {symbolTable.zoneName || 'None'}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reserved Slots</span>
          <span className="text-sm font-bold text-red-400 mt-1">
            {symbolTable.reservedSlots.size > 0 
              ? Array.from(symbolTable.reservedSlots).join(', ') 
              : 'None'}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Last Gate Status</span>
          <span className={`text-sm font-bold mt-1 uppercase ${
            symbolTable.gateStatus === 'open' ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {symbolTable.gateStatus.toUpperCase()}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Sensor Checks</span>
          <span className="text-sm font-bold text-yellow-400 mt-1">
            {symbolTable.sensorCheckCount} check{symbolTable.sensorCheckCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Raw Table */}
      <div className="bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-y-auto max-h-[200px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-2.5 px-4">Symbol / Key</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 font-mono">Status Value</th>
                <th className="py-2.5 px-4 text-right">Updated Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm font-mono">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 font-medium">
                    Symbol table is empty. Compile code to populate.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-4 font-bold text-slate-200">{row.name}</td>
                    <td className="py-2 px-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight ${
                        row.type === 'Zone' ? 'bg-cyan-950 text-cyan-400' :
                        row.type === 'Slot' ? 'bg-indigo-950 text-indigo-400' :
                        row.type === 'Gate' ? 'bg-emerald-950 text-emerald-400' :
                        row.type === 'Sensor' ? 'bg-yellow-950 text-yellow-400' :
                        'bg-red-950 text-red-400'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-350">{row.value}</td>
                    <td className="py-2 px-4 text-right text-slate-500 text-xs">Line {row.line}</td>
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
