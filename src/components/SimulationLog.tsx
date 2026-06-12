import React, { useEffect, useRef } from 'react';
import { Eye, ArrowRight, CornerDownRight } from 'lucide-react';
import { SimulationStep } from '../compiler/simulator';

interface SimulationLogProps {
  steps: SimulationStep[];
  currentStepIndex: number;
}

export const SimulationLog: React.FC<SimulationLogProps> = ({ steps, currentStepIndex }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active step into view inside the tab panel
  useEffect(() => {
    if (tableRef.current) {
      const activeRow = tableRef.current.querySelector('[data-active="true"]');
      if (activeRow) {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStepIndex]);

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden" ref={tableRef}>
      <div className="overflow-x-auto max-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <th className="py-2.5 px-4 font-mono w-16">Step</th>
              <th className="py-2.5 px-4">Source Instruction</th>
              <th className="py-2.5 px-4">Action</th>
              <th className="py-2.5 px-4">Result Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-sm font-mono">
            {steps.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                  Simulation log is empty. Compile a valid program and run the simulation.
                </td>
              </tr>
            ) : (
              steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                return (
                  <tr
                    key={idx}
                    data-active={isActive}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-950/45 text-cyan-200 font-bold border-y border-cyan-800/40 shadow-inner'
                        : 'hover:bg-slate-850/30 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                          {idx}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">{idx}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={isActive ? 'text-slate-100' : 'text-slate-350'}>
                          {step.sourceCommand}
                        </span>
                        {isActive && step.explanation && (
                          <div className="text-[10px] text-cyan-455 font-semibold font-sans flex items-start gap-1 mt-0.5 py-0.5 px-1 bg-cyan-950/80 rounded border border-cyan-900/30">
                            <CornerDownRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{step.explanation}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                        step.action.toLowerCase().includes('emergency')
                          ? 'bg-red-950/80 text-red-400 border border-red-800/40 animate-pulse'
                          : step.action.toLowerCase().includes('open')
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                          : step.action.toLowerCase().includes('close')
                          ? 'bg-slate-900 text-slate-400 border border-slate-750'
                          : step.action.toLowerCase().includes('reserve')
                          ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/40'
                          : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/40'
                      }`}>
                        {step.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs font-semibold text-slate-350">
                      {step.status}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
