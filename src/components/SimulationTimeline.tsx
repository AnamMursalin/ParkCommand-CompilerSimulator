import React, { useEffect, useRef } from 'react';
import { ArrowRight, Activity, Radio, KeyRound, ShieldAlert, BadgeCheck, CornerDownRight } from 'lucide-react';
import type { SimulationStep } from '../compiler/simulator';

interface SimulationTimelineProps {
  steps: SimulationStep[];
  currentStepIndex: number;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  steps,
  currentStepIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active step card into horizontal center view
  useEffect(() => {
    if (containerRef.current) {
      const activeCard = containerRef.current.querySelector('[data-active="true"]');
      if (activeCard) {
        activeCard.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentStepIndex]);

  const getStepIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('gate')) return <BadgeCheck className="w-4 h-4 text-emerald-400" />;
    if (act.includes('slot')) return <KeyRound className="w-4 h-4 text-indigo-400" />;
    if (act.includes('sensor')) return <Radio className="w-4 h-4 text-cyan-400" />;
    if (act.includes('emergency')) return <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const getCardBorder = (isActive: boolean, action: string) => {
    if (!isActive) return 'border-slate-800 bg-slate-950/40 opacity-50 text-slate-400';
    
    const act = action.toLowerCase();
    if (act.includes('emergency')) return 'border-red-500 bg-red-950/20 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    if (act.includes('gate')) return 'border-emerald-500 bg-emerald-950/25 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
    if (act.includes('slot')) return 'border-indigo-500 bg-indigo-950/20 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.25)]';
    return 'border-cyan-500 bg-cyan-950/20 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-1.5 px-1">
        <span>Execution Steps Timeline</span>
        {steps.length > 0 && (
          <span className="font-mono text-[10px] text-cyan-400">
            Step {currentStepIndex} of {steps.length - 1}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex items-center gap-3.5 overflow-x-auto py-2 px-1 select-none scroll-smooth min-h-[90px]"
      >
        {steps.length === 0 ? (
          <div className="w-full text-center py-4 text-xs text-slate-500 font-semibold font-sans">
            Simulation timeline idle. Compile a valid program to generate execution step cards.
          </div>
        ) : (
          steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            return (
              <React.Fragment key={idx}>
                {/* Connecting Arrow */}
                {idx > 0 && (
                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-750'}`} />
                )}

                {/* Step Card */}
                <div
                  data-active={isActive}
                  className={`flex-shrink-0 w-52 p-2.5 rounded-lg border flex flex-col gap-1 transition-all duration-300 ${getCardBorder(
                    isActive,
                    step.action
                  )}`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                    <span className="font-mono">STEP {idx}</span>
                    <span className="flex items-center gap-1">
                      {getStepIcon(step.action)}
                      {step.action}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold truncate mt-0.5" title={step.sourceCommand}>
                    {step.sourceCommand}
                  </div>

                  <div className="text-[10px] opacity-80 leading-normal truncate font-sans">
                    {step.status}
                  </div>

                  {isActive && (
                    <div className="w-full h-1 bg-cyan-400 rounded-full mt-1.5 animate-pulse" />
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
