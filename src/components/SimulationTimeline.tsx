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
    if (act.includes('gate')) return <BadgeCheck className="w-4 h-4 text-emerald-600" />;
    if (act.includes('slot')) return <KeyRound className="w-4 h-4 text-indigo-600" />;
    if (act.includes('sensor')) return <Radio className="w-4 h-4 text-cyan-600" />;
    if (act.includes('emergency')) return <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />;
    return <Activity className="w-4 h-4 text-slate-500" />;
  };

  const getCardBorder = (isActive: boolean, action: string) => {
    if (!isActive) return 'border-slate-200 bg-slate-50 opacity-50 text-slate-500';
    
    const act = action.toLowerCase();
    if (act.includes('emergency')) return 'border-red-500 bg-red-50 text-red-700 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    if (act.includes('gate')) return 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    if (act.includes('slot')) return 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_15px_rgba(99,102,241,0.15)]';
    return 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
  };

  return (
    <div className="bg-white border border-slate-700 rounded-xl p-5 shadow-md flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-slate-700 font-bold uppercase tracking-wider border-b border-slate-300 pb-2 px-1">
        <span>Execution Steps Timeline</span>
        {steps.length > 0 && (
          <span className="font-mono text-xs text-cyan-700">
            Step {currentStepIndex} of {steps.length - 1}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex items-center gap-4 overflow-x-auto py-3 px-1 select-none scroll-smooth min-h-[110px]"
      >
        {steps.length === 0 ? (
          <div className="w-full text-center py-6 text-sm text-slate-600 font-semibold font-sans">
            Simulation timeline idle. Compile a valid program to generate execution step cards.
          </div>
        ) : (
          steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            return (
              <React.Fragment key={idx}>
                {/* Connecting Arrow */}
                {idx > 0 && (
                  <ArrowRight className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-700 animate-pulse' : 'text-slate-400'}`} />
                )}

                {/* Step Card */}
                <div
                  data-active={isActive}
                  className={`flex-shrink-0 w-64 p-3.5 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${getCardBorder(
                    isActive,
                    step.action
                  )}`}
                >
                  <div className="flex justify-between items-center text-xs font-bold tracking-tight">
                    <span className="font-mono">STEP {idx}</span>
                    <span className="flex items-center gap-1.5">
                      {getStepIcon(step.action)}
                      {step.action}
                    </span>
                  </div>

                  <div className="text-sm font-mono font-bold truncate mt-1" title={step.sourceCommand}>
                    {step.sourceCommand}
                  </div>

                  <div className="text-xs opacity-80 leading-normal truncate font-sans">
                    {step.status}
                  </div>

                  {isActive && (
                    <div className="w-full h-1.5 bg-cyan-600 rounded-full mt-1.5 animate-pulse" />
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
