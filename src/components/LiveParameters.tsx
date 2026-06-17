import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
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
    <div className="bg-white border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col gap-5">
      <div className="border-b border-slate-300 pb-3">
        <span className="font-bold text-slate-900 text-base tracking-wide">Live Simulation Parameters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Slots Slider */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700 font-semibold">Available Slots (slots)</span>
            <span className={`font-bold font-mono text-lg ${inputs.slotsCount > 20 ? 'text-emerald-700' : inputs.slotsCount > 0 ? 'text-yellow-700' : 'text-red-700 animate-pulse'}`}>
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
            className="w-full accent-cyan-600 bg-slate-100 rounded-lg h-3 border border-slate-300 cursor-pointer"
          />
        </div>

        {/* Approaching Vehicle Type */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm text-slate-700 font-semibold">Approaching Vehicle (vehicle)</span>
          <select
            value={inputs.approachingVehicle}
            onChange={(e) =>
              onInputsChange({
                ...inputs,
                approachingVehicle: e.target.value,
              })
            }
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-600 transition-all cursor-pointer font-mono"
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
        <div className="flex flex-col gap-2.5 justify-center">
          <span className="text-sm text-slate-700 font-semibold">Auto-Close Gate Protocol</span>
          <button
            onClick={() => onAutoCloseToggle(!autoCloseGate)}
            className="flex items-center gap-3 text-sm font-semibold py-2.5 text-left text-slate-800 focus:outline-none w-fit group"
          >
            {autoCloseGate ? (
              <ToggleRight className="w-8 h-8 text-emerald-600 transition-all group-hover:scale-105" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400 transition-all group-hover:scale-105" />
            )}
            <span>{autoCloseGate ? 'ENABLED (Close after car)' : 'DISABLED (Keep open)'}</span>
          </button>
        </div>

        {/* Emergency Mode Toggle */}
        <div className="flex flex-col gap-2.5 justify-center">
          <span className="text-sm text-slate-700 font-semibold">Emergency Mode Bypass</span>
          <button
            onClick={() => onEmergencyModeToggle(!emergencyMode)}
            className="flex items-center gap-3 text-sm font-semibold py-2.5 text-left text-slate-800 focus:outline-none w-fit group"
          >
            {emergencyMode ? (
              <ToggleRight className="w-8 h-8 text-red-600 transition-all group-hover:scale-105 animate-pulse" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400 transition-all group-hover:scale-105" />
            )}
            <span className={emergencyMode ? 'text-red-700 font-bold' : ''}>
              {emergencyMode ? 'SIRENS ACTIVE' : 'SIRENS OFF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
