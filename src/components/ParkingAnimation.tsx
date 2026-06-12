import React from 'react';
import { ShieldAlert, Car, Radio, HelpCircle, ToggleLeft, Activity } from 'lucide-react';
import { SimulationInputs, SimulationStep } from '../compiler/simulator';

interface ParkingAnimationProps {
  inputs: SimulationInputs;
  onInputsChange: (newInputs: SimulationInputs) => void;
  currentStep: SimulationStep | null;
}

export const ParkingAnimation: React.FC<ParkingAnimationProps> = ({
  inputs,
  onInputsChange,
  currentStep,
}) => {
  // Configured slots list
  const visualSlots = [
    { id: 'VIP_A1', label: 'VIP A1', type: 'VIP' },
    { id: 'VIP_A2', label: 'VIP A2', type: 'VIP' },
    { id: 'STAFF_B1', label: 'Staff B1', type: 'Staff' },
    { id: 'STAFF_B2', label: 'Staff B2', type: 'Staff' },
    { id: 'VISITOR_C1', label: 'Visitor C1', type: 'Visitor' },
    { id: 'VISITOR_C2', label: 'Visitor C2', type: 'Visitor' },
  ];

  // Derive parameters from current step if available, else use inputs
  const gateState = currentStep ? currentStep.gateState : 'closed';
  const reservedSlots = currentStep ? currentStep.slotsReserved : [];
  const sensorBlinking = currentStep ? currentStep.sensorBlinking : false;
  const emergencyActive = currentStep ? currentStep.emergencyOverride : false;
  
  // Decide which vehicle should be displayed
  // If simulation is running, it could be the emergency vehicle or normal vehicle
  const activeVehicleType = currentStep?.activeVehicle 
    ? currentStep.activeVehicle 
    : inputs.approachingVehicle;

  // Determine vehicle horizontal position classes
  let carPosClass = '-translate-x-32 opacity-0'; // Off screen left
  
  if (currentStep) {
    if (currentStep.stepNumber === 0) {
      // Init state
      carPosClass = 'translate-x-4 opacity-100'; // Approaching
    } else if (currentStep.action.toLowerCase().includes('sensor') || currentStep.action.toLowerCase().includes('evaluate') || currentStep.action.toLowerCase().includes('condition')) {
      // Scanning at sensor
      carPosClass = 'translate-x-36 opacity-100';
    } else if (currentStep.action.toLowerCase().includes('emergency') || currentStep.action.toLowerCase().includes('override')) {
      // Emergency override
      carPosClass = 'translate-x-36 opacity-100 scale-105';
    } else if (gateState === 'open') {
      // Drives through
      carPosClass = 'translate-x-80 opacity-0 scale-95 transition-all duration-1000';
    } else {
      // Stopped in front of closed gate
      carPosClass = 'translate-x-36 opacity-100';
    }
  } else {
    // Idle state
    carPosClass = 'translate-x-4 opacity-100';
  }

  const getVehicleColor = (type: string) => {
    switch (type) {
      case 'ambulance': return 'bg-red-500 border-red-300 text-white';
      case 'police': return 'bg-blue-600 border-blue-400 text-white';
      case 'firetruck': return 'bg-orange-600 border-orange-400 text-white';
      case 'VIP': return 'bg-purple-600 border-purple-400 text-amber-300';
      case 'staff': return 'bg-teal-600 border-teal-400 text-slate-100';
      default: return 'bg-slate-500 border-slate-400 text-slate-100';
    }
  };

  const getVehicleName = (type: string) => {
    if (type === 'VIP') return 'VIP Car';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Animation Header */}
      <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-slate-200 tracking-wide text-sm">Interactive Simulation View</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            gateState === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            Gate: {gateState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Simulation Arena */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col justify-between p-4 min-h-[350px]">
        {/* Emergency Banner */}
        {emergencyActive && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-red-600/90 text-white px-4 py-2 rounded-lg flex items-center gap-3 border border-red-400 animate-pulse shadow-lg">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <div className="text-xs font-bold">
              EMERGENCY OVERRIDE ACTIVE: Gate forced open for emergency response ({activeVehicleType?.toUpperCase()})!
            </div>
          </div>
        )}

        {/* Visual Parking slots */}
        <div className="grid grid-cols-6 gap-2 w-full pt-16">
          {visualSlots.map((slot) => {
            const isReserved = reservedSlots.includes(slot.id);
            return (
              <div
                key={slot.id}
                className={`relative h-20 rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all duration-500 ${
                  isReserved
                    ? 'bg-red-950/40 border-red-500/60 text-red-400 shadow-inner'
                    : 'bg-slate-900/60 border-emerald-500/30 text-slate-400 hover:border-emerald-500/50'
                }`}
              >
                <span className="text-[10px] font-bold tracking-tight">{slot.label}</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-500 mt-0.5">{slot.type}</span>
                {isReserved ? (
                  <Car className="w-6 h-6 text-red-500 mt-1 animate-bounce" />
                ) : (
                  <div className="w-6 h-6 border border-dashed border-slate-700 rounded-md mt-1 flex items-center justify-center text-[9px] text-slate-600 font-bold">
                    FREE
                  </div>
                )}
                {/* Yellow slots border markings */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-yellow-500/40 rounded-l" />
                <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-yellow-500/40 rounded-r" />
              </div>
            );
          })}
        </div>

        {/* Entry Road and Gate Assembly */}
        <div className="relative h-44 bg-slate-900/40 border-y-2 border-slate-800 rounded-lg flex items-center my-4">
          {/* Road Markings */}
          <div className="absolute left-0 right-0 h-[2px] border-t-2 border-dashed border-slate-700/60 top-1/2 -translate-y-1/2" />

          {/* Occupancy Sensor */}
          <div className="absolute left-36 top-4 flex flex-col items-center">
            <span className="text-[8px] text-slate-500 font-bold uppercase mb-1">Sensor</span>
            <div className="relative">
              <Radio className={`w-6 h-6 ${sensorBlinking ? 'text-cyan-400' : 'text-slate-600'}`} />
              {sensorBlinking && (
                <div className="absolute inset-0 w-6 h-6 rounded-full bg-cyan-400/30 animate-ping" />
              )}
            </div>
          </div>

          {/* Gate Barrier */}
          <div className="absolute left-60 top-0 bottom-0 w-8 flex flex-col items-center justify-center z-10">
            {/* Gate Post */}
            <div className="w-4 h-6 bg-slate-700 rounded-t border-t border-slate-600 absolute bottom-4 shadow" />
            
            {/* Barrier Bar */}
            <div
              style={{
                transform: gateState === 'open' ? 'rotate(-75deg)' : 'rotate(0deg)',
                transformOrigin: 'bottom right',
              }}
              className="absolute bottom-[22px] right-2 w-1.5 h-16 bg-gradient-to-t from-red-500 via-white to-red-500 border border-slate-800 rounded-full transition-transform duration-500 ease-in-out shadow-lg"
            >
              {/* Stripes */}
              <div className="w-full h-full flex flex-col justify-between py-1 opacity-80">
                <div className="h-1 bg-red-600" />
                <div className="h-1 bg-slate-800" />
                <div className="h-1 bg-red-600" />
              </div>
            </div>
            <span className="absolute bottom-1 text-[8px] text-slate-500 font-bold uppercase">Gate</span>
          </div>

          {/* Animated Vehicle */}
          <div
            className={`absolute left-0 flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-700 ease-out shadow-xl ${carPosClass} ${getVehicleColor(
              activeVehicleType
            )}`}
          >
            <div className="relative flex items-center gap-1.5 px-2 py-1 font-bold text-xs uppercase tracking-wide">
              {activeVehicleType === 'ambulance' || activeVehicleType === 'police' || activeVehicleType === 'firetruck' ? (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 animate-ping border border-white" />
              ) : null}
              <Car className="w-4 h-4" />
              <span>{getVehicleName(activeVehicleType)}</span>
            </div>
          </div>
        </div>

        {/* Live Parameters Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
            <ToggleLeft className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">Live Simulation Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slots Count Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Available Slots (slots)</span>
                <span className="text-cyan-400 font-mono font-bold">{inputs.slotsCount}</span>
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
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Approaching Vehicle Dropdown */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Approaching Vehicle (vehicle)</span>
              <select
                value={inputs.approachingVehicle}
                onChange={(e) =>
                  onInputsChange({
                    ...inputs,
                    approachingVehicle: e.target.value,
                  })
                }
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="visitor">Visitor (Normal Car)</option>
                <option value="staff">Staff Car</option>
                <option value="VIP">VIP Vehicle</option>
                <option value="ambulance">Ambulance (Emergency)</option>
                <option value="police">Police Patrol (Emergency)</option>
                <option value="firetruck">Firetruck (Emergency)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
