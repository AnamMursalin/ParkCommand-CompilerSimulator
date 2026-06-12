import React from 'react';
import { ToggleLeft, ToggleRight, Info, AlertTriangle, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { SimulationInputs } from '../compiler/simulator';

interface LiveParametersProps {
  inputs: SimulationInputs;
  onInputsChange: (newInputs: SimulationInputs) => void;
  autoCloseGate: boolean;
  onAutoCloseToggle: (val: boolean) => void;
  emergencyMode: boolean;
  onEmergencyModeToggle: (val: boolean) => void;
}

export const LiveParameters: React.FC<LiveParametersProps> = ({
  inputs,
  onInputsChange,
  autoCloseGate,
  onAutoCloseToggle,
  emergencyMode,
  onEmergencyModeToggle,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3.5">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-slate-200 text-sm tracking-wide">Live Simulation Parameters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Slots Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">Available Slots (slots)</span>
            <span className={`font-bold font-mono ${inputs.slotsCount > 20 ? 'text-emerald-400' : inputs.slotsCount > 0 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`}>
              {inputs.slotsCount}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={inputs.slotsCount}
            onChange={(e) =>
              onInputsChange({
                ...inputs,
                slotsCount: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-cyan-500 bg-slate-950 rounded-lg h-2 border border-slate-850 cursor-pointer"
          />
        </div>

        {/* Approaching Vehicle Type */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-400 font-semibold">Approaching Vehicle (vehicle)</span>
          <select
            value={inputs.approachingVehicle}
            onChange={(e) =>
              onInputsChange({
                ...inputs,
                approachingVehicle: e.target.value,
              })
            }
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 transition-all cursor-pointer font-mono"
          >
            <option value="visitor">Visitor (Normal Car)</option>
            <option value="staff">Staff Car</option>
            <option value="VIP">VIP Vehicle</option>
            <option value="ambulance">Ambulance (Emergency)</option>
            <option value="police">Police Patrol (Emergency)</option>
            <option value="firetruck">Firetruck (Emergency)</option>
          </select>
        </div>

        {/* Auto-Close Gate Toggle */}
        <div className="flex flex-col gap-1.5 justify-center">
          <span className="text-xs text-slate-400 font-semibold">Auto-Close Gate Protocol</span>
          <button
            onClick={() => onAutoCloseToggle(!autoCloseGate)}
            className="flex items-center gap-2 text-xs font-semibold py-1.5 text-left text-slate-350 focus:outline-none w-fit group"
          >
            {autoCloseGate ? (
              <ToggleRight className="w-7 h-7 text-emerald-400 transition-all group-hover:scale-105" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-600 transition-all group-hover:scale-105" />
            )}
            <span>{autoCloseGate ? 'ENABLED (Close after car)' : 'DISABLED (Keep open)'}</span>
          </button>
        </div>

        {/* Emergency Mode Toggle */}
        <div className="flex flex-col gap-1.5 justify-center">
          <span className="text-xs text-slate-400 font-semibold">Emergency Mode Bypass</span>
          <button
            onClick={() => onEmergencyModeToggle(!emergencyMode)}
            className="flex items-center gap-2 text-xs font-semibold py-1.5 text-left text-slate-350 focus:outline-none w-fit group"
          >
            {emergencyMode ? (
              <ToggleRight className="w-7 h-7 text-red-500 transition-all group-hover:scale-105 animate-pulse" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-600 transition-all group-hover:scale-105" />
            )}
            <span className={emergencyMode ? 'text-red-400 font-bold' : ''}>
              {emergencyMode ? 'SIRENS ACTIVE' : 'SIRENS OFF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
