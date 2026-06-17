import React, { useEffect, useRef } from 'react';
import { ArrowRight, CornerDownRight } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-700 overflow-hidden" ref={tableRef}>
      <div className="overflow-x-auto max-h-[350px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-800 text-sm font-semibold uppercase tracking-wider border-b border-slate-300">
              <th className="py-3.5 px-5 font-mono w-20">Step</th>
              <th className="py-3.5 px-5">Source Instruction</th>
              <th className="py-3.5 px-5">Action</th>
              <th className="py-3.5 px-5">Result Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-base font-mono">
            {steps.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-600 font-medium">
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
                        ? 'bg-cyan-50 text-cyan-900 font-bold border-y border-cyan-300 shadow-inner'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono">
                      {isActive ? (
                        <span className="flex items-center gap-2 text-cyan-700">
                          <ArrowRight className="w-4.5 h-4.5 animate-pulse" />
                          {idx}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-sm">{idx}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1">
                        <span className={isActive ? 'text-slate-900' : 'text-slate-800'}>
                          {step.sourceCommand}
                        </span>
                        {isActive && step.explanation && (
                          <div className="text-sm text-cyan-800 font-semibold font-sans flex items-start gap-2 mt-1 py-1 px-2 bg-cyan-100 rounded border border-cyan-300">
                            <CornerDownRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{step.explanation}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-3 py-1.5 rounded text-sm font-bold uppercase tracking-tight ${
                        step.action.toLowerCase().includes('emergency')
                          ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                          : step.action.toLowerCase().includes('open')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : step.action.toLowerCase().includes('close')
                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                          : step.action.toLowerCase().includes('reserve')
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                      }`}>
                        {step.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sm font-semibold text-slate-700">
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
