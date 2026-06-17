import React from 'react';
import { ShieldAlert, Info, Radio, Power } from 'lucide-react';
import type { SimulationStep } from '../compiler/simulator';

interface ParkingSimulationProps {
  currentStep: SimulationStep | null;
  slotsCount: number;
  approachingVehicle: string;
  emergencyMode: boolean;
}

export const ParkingSimulation: React.FC<ParkingSimulationProps> = ({
  currentStep,
  slotsCount,
  approachingVehicle,
  emergencyMode,
}) => {
  const gateState = currentStep ? currentStep.gateState : 'closed';
  const reservedSlots = currentStep ? currentStep.slotsReserved : [];
  const occupiedSlots = currentStep ? currentStep.slotsOccupied : {};
  const sensorBlinking = currentStep ? currentStep.sensorBlinking : false;
  const emergencyActive = currentStep ? currentStep.emergencyOverride : false;

  // Active vehicle type in simulation frame
  const activeVehicle = currentStep?.activeVehicle
    ? currentStep.activeVehicle
    : (approachingVehicle as any);

  // visual slots configuration
  const slotsConfig = [
    { id: 'VIP_A1', label: 'VIP A1', type: 'VIP', row: 'top' },
    { id: 'STAFF_B1', label: 'Staff B1', type: 'Staff', row: 'top' },
    { id: 'VISITOR_C1', label: 'Visitor C1', type: 'Visitor', row: 'top' },
    { id: 'VIP_A2', label: 'VIP A2', type: 'VIP', row: 'bottom' },
    { id: 'STAFF_B2', label: 'Staff B2', type: 'Staff', row: 'bottom' },
    { id: 'VISITOR_C2', label: 'Visitor C2', type: 'Visitor', row: 'bottom' },
  ];

  // Helper to draw a top-down vehicle SVG based on type
  const renderTopDownCar = (type: string, isParked = false) => {
    let carColor = '#475569'; // default slate-600
    let windshieldColor = '#0f172a';
    let label = 'CAR';
    let isEmergency = false;
    let beaconColor = 'bg-blue-500';

    switch (type) {
      case 'ambulance':
        carColor = '#ef4444'; // red
        windshieldColor = '#ffffff';
        label = 'AMB';
        isEmergency = true;
        beaconColor = 'bg-red-500 animate-ping';
        break;
      case 'police':
        carColor = '#1e3a8a'; // dark blue
        windshieldColor = '#38bdf8';
        label = 'POLICE';
        isEmergency = true;
        beaconColor = 'bg-blue-500 animate-ping';
        break;
      case 'firetruck':
        carColor = '#ea580c'; // orange-red
        windshieldColor = '#fed7aa';
        label = 'FIRE';
        isEmergency = true;
        beaconColor = 'bg-orange-500 animate-ping';
        break;
      case 'VIP':
        carColor = '#581c87'; // royal purple
        windshieldColor = '#fde047'; // gold
        label = 'VIP';
        break;
      case 'staff':
        carColor = '#0d9488'; // teal
        windshieldColor = '#ccfbf1';
        label = 'STAFF';
        break;
      case 'visitor':
        carColor = '#4b5563'; // gray
        windshieldColor = '#f3f4f6';
        label = 'VISIT';
        break;
      default:
        carColor = '#4b5563';
        windshieldColor = '#f3f4f6';
        label = type.substring(0, 5).toUpperCase();
        break;
    }

    return (
      <svg
        viewBox="0 0 100 50"
        className={`w-full h-full transition-transform duration-500 ${isParked ? 'rotate-90 scale-90' : ''}`}
      >
        {/* Wheels */}
        <rect x="12" y="-2" width="16" height="6" rx="2" fill="#000" />
        <rect x="72" y="-2" width="16" height="6" rx="2" fill="#000" />
        <rect x="12" y="46" width="16" height="6" rx="2" fill="#000" />
        <rect x="72" y="46" width="16" height="6" rx="2" fill="#000" />

        {/* Chassis */}
        <rect x="5" y="2" width="90" height="46" rx="10" fill={carColor} stroke="#ffffff30" strokeWidth="2" />
        
        {/* Hood lines */}
        <rect x="65" y="8" width="22" height="34" rx="3" fill="#00000020" />

        {/* Cabin Glass */}
        <path d="M 30,8 L 60,8 L 68,14 L 68,36 L 60,42 L 30,42 L 24,36 L 24,14 Z" fill={windshieldColor} opacity="0.8" />
        <rect x="34" y="11" width="22" height="28" fill="#00000015" />

        {/* Headlights */}
        <polygon points="90,8 96,12 90,16" fill="#fef08a" />
        <polygon points="90,34 96,38 90,42" fill="#fef08a" />

        {/* Tail lights */}
        <rect x="4" y="8" width="3" height="8" fill="#ef4444" />
        <rect x="4" y="34" width="3" height="8" fill="#ef4444" />

        {/* Labels / Decals */}
        <text x="48" y="29" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
          {label}
        </text>

        {/* Emergency Beacon Lights */}
        {isEmergency && (
          <circle cx="48" cy="25" r="5" fill="#f43f5e" className="animate-pulse" />
        )}
      </svg>
    );
  };

  // horizontal positions for cars entering the plaza
  let vehiclePosClass = '-translate-x-36 opacity-0';
  let isMoving = false;

  if (currentStep) {
    if (currentStep.stepNumber === 0) {
      vehiclePosClass = 'left-[10%] opacity-100'; // Entered road
      isMoving = true;
    } else if (currentStep.action.toLowerCase().includes('sensor') || currentStep.action.toLowerCase().includes('evaluate')) {
      vehiclePosClass = 'left-[40%] opacity-100'; // At sensor
      isMoving = true;
    } else if (currentStep.action.toLowerCase().includes('emergency') || currentStep.action.toLowerCase().includes('override')) {
      vehiclePosClass = 'left-[40%] opacity-100 scale-105'; // Siren beacon override
      isMoving = true;
    } else if (gateState === 'open') {
      vehiclePosClass = 'left-[80%] opacity-0 scale-90 transition-all duration-1000 ease-in-out'; // Passed
    } else {
      vehiclePosClass = 'left-[40%] opacity-100'; // Blocked at gate
    }
  } else {
    // Idle state
    vehiclePosClass = 'left-[10%] opacity-100';
  }

  // Check if we are executing a condition evaluation card
  const isCondEvaluation = currentStep && currentStep.action === 'Evaluate Condition';

  // Total occupied/reserved
  const totalUnavailableSlotsCount = reservedSlots.length + Object.keys(occupiedSlots).length;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-700 rounded-xl overflow-hidden shadow-xl relative">
      {/* Simulation Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900 tracking-wide text-base">Real-Time Parking Simulation</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Gate status:</span>
            <span className={`px-3 py-1 rounded text-xs font-extrabold uppercase tracking-wider ${
              gateState === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {gateState.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Occupancy:</span>
            <span className="font-bold text-sm text-cyan-800 font-mono">
              {6 - totalUnavailableSlotsCount} / 6 FREE
            </span>
          </div>
        </div>
      </div>

      {/* Main Simulation View Area */}
      <div className="flex-1 bg-white p-5 min-h-[400px] relative flex flex-col justify-between overflow-hidden">
        {/* Emergency Override Siren Flasher */}
        {(emergencyActive || emergencyMode) && (
          <div className="absolute inset-0 bg-red-100/40 pointer-events-none z-20 flex flex-col justify-between p-3 border border-red-400 animate-pulse">
            <div className="bg-red-700 text-white font-bold text-sm py-2 px-6 rounded-lg flex items-center justify-between shadow-lg border border-red-500">
              <span className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
                EMERGENCY SIRENS ACTIVE — GATE BARRIER BYPASSED
              </span>
              <span className="text-xs animate-pulse">SIRENS FLASHING 🚨</span>
            </div>
          </div>
        )}

        {/* Condition Check Overlay Popup */}
        {isCondEvaluation && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35 bg-white border-2 border-cyan-600 rounded-xl p-5 shadow-2xl w-80 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 text-cyan-700 font-bold text-sm border-b border-slate-300 pb-2 uppercase tracking-wide">
              <Info className="w-5 h-5" />
              <span>Condition Evaluated</span>
            </div>
            <div className="flex flex-col gap-3 mt-3 font-mono text-sm text-slate-700">
              <div className="flex justify-between">
                <span>slotsCount (slider):</span>
                <span className="text-slate-900 font-bold">{slotsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>approachingVehicle:</span>
                <span className="text-slate-900 font-bold capitalize">{approachingVehicle}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3">
                <span>Evaluated Logic:</span>
                <span className="text-cyan-700 font-bold">{currentStep?.sourceCommand.replace('then ...', '')}</span>
              </div>
              <div className="flex justify-between items-center mt-2 py-2 px-3 rounded bg-slate-100">
                <span>Logic Result:</span>
                <span className={`font-bold px-2 py-1 rounded text-xs uppercase ${
                  currentStep?.conditionResult === 'true' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {currentStep?.conditionResult === 'true' ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Parking slots Grid (3 Slots) */}
        <div className="grid grid-cols-3 gap-5 w-full">
          {slotsConfig.filter(s => s.row === 'top').map(slot => {
            const isReservedOnly = reservedSlots.includes(slot.id);
            const occupiedVehicleType = occupiedSlots[slot.id];
            const isOccupied = !!occupiedVehicleType;

            let slotBorderClass = 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700';
            let statusLabel = 'FREE';
            let labelColor = 'text-emerald-700';

            if (isOccupied) {
              slotBorderClass = 'bg-red-50 border-red-400 shadow-inner text-red-700';
              statusLabel = 'OCCUPIED';
              labelColor = 'text-red-700';
            } else if (isReservedOnly) {
              slotBorderClass = 'bg-amber-50 border-amber-400 shadow-inner text-amber-700';
              statusLabel = 'RESERVED';
              labelColor = 'text-amber-700';
            }

            return (
              <div
                key={slot.id}
                className={`h-28 rounded-xl border-2 relative flex flex-col items-center justify-between p-3 transition-all duration-500 ${slotBorderClass}`}
              >
                <div className="flex justify-between w-full text-xs font-bold font-mono">
                  <span>{slot.label}</span>
                  <span className={labelColor}>
                    {statusLabel}
                  </span>
                </div>
                {/* Yellow parking paint lines */}
                <div className="absolute left-0 bottom-0 top-0 w-1.5 bg-yellow-400/50" />
                <div className="absolute right-0 bottom-0 top-0 w-1.5 bg-yellow-400/50" />

                {isOccupied ? (
                  <div className="w-16 h-8 relative animate-fade-in">
                    {renderTopDownCar(occupiedVehicleType, true)}
                  </div>
                ) : isReservedOnly ? (
                  <span className="text-xs px-3 py-1 rounded border border-amber-400 bg-amber-100 text-amber-800 font-bold uppercase tracking-wider my-auto">
                    Reserved
                  </span>
                ) : (
                  <span className="text-xs tracking-wider uppercase font-bold text-slate-500 my-auto">Available</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Roadway Center Strip */}
        <div className="relative h-52 bg-slate-100 rounded-2xl border-y-4 border-slate-300 flex items-center shadow-inner my-5">
          {/* Yellow Dashed Center Line */}
          <div className="absolute left-0 right-0 h-1 border-t-2 border-dashed border-yellow-400/70 top-1/2 -translate-y-1/2" />
          
          {/* Lane marking text labels */}
          <span className="absolute left-6 top-3 text-xs text-slate-600 font-extrabold uppercase font-mono tracking-wider">ENTRANCE ROAD →</span>
          <span className="absolute right-6 bottom-3 text-xs text-slate-600 font-extrabold uppercase font-mono tracking-wider">← EXIT ROAD</span>

          {/* Pulsing Radar Sensor Tower */}
          <div className="absolute left-[38%] top-1/2 -translate-y-1/2 flex flex-col items-center z-15">
            <div className="relative flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                sensorBlinking ? 'bg-cyan-100 text-cyan-700 ring-2 ring-cyan-600' : 'bg-white border border-slate-300 text-slate-500'
              }`}>
                <Radio className="w-5 h-5" />
              </div>
              {/* Ripple radar waves */}
              {sensorBlinking && (
                <>
                  <div className="absolute w-14 h-14 rounded-full border border-cyan-500/40 animate-ping" />
                  <div className="absolute w-20 h-20 rounded-full border border-cyan-600/20 animate-ping [animation-delay:0.3s]" />
                </>
              )}
            </div>
            <span className="text-xs text-slate-500 font-bold uppercase mt-1.5 font-mono">SENSOR</span>
          </div>

          {/* Traffic Light Assembly */}
          <div className="absolute left-[54%] top-5 flex gap-1.5 bg-white p-1.5 rounded-md border border-slate-300 z-20">
            {/* Red Light */}
            <div className={`w-4 h-4 rounded-full transition-all ${
              gateState === 'closed' ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.9)]' : 'bg-red-100'
            }`} />
            {/* Green Light */}
            <div className={`w-4 h-4 rounded-full transition-all ${
              gateState === 'open' ? 'bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.9)]' : 'bg-emerald-100'
            }`} />
          </div>

          {/* Physical Gate Barrier */}
          <div className="absolute left-[58%] top-0 bottom-1/2 w-5 flex flex-col items-center justify-end z-25">
            {/* Gate Box */}
            <div className="w-6 h-8 bg-slate-300 rounded border border-slate-400 flex items-center justify-center shadow-lg relative z-30">
              <Power className={`w-4 h-4 ${gateState === 'open' ? 'text-emerald-700' : 'text-red-700'}`} />
            </div>
            
            {/* Pivoting Striped Arm */}
            <div
              style={{
                transform: gateState === 'open' ? 'rotate(-85deg)' : 'rotate(0deg)',
                transformOrigin: 'bottom right',
              }}
              className="absolute bottom-1.5 right-2.5 w-2 h-20 bg-gradient-to-t from-red-600 via-white to-red-600 border border-slate-300 rounded-full transition-transform duration-500 ease-out z-20 shadow-md"
            >
              {/* Stripes decoration */}
              <div className="w-full h-full flex flex-col justify-between py-1.5 opacity-70">
                <div className="h-3 bg-red-700" />
                <div className="h-3 bg-slate-300" />
                <div className="h-3 bg-red-700" />
              </div>
            </div>
          </div>

          {/* Exit Gate Decoration */}
          <div className="absolute left-[24%] bottom-0 top-1/2 w-5 flex flex-col items-center justify-start z-25">
            {/* Striped Exit Gate Arm (Always open visually) */}
            <div
              style={{
                transform: 'rotate(85deg)',
                transformOrigin: 'top right',
              }}
              className="absolute top-1.5 right-2.5 w-2 h-20 bg-gradient-to-b from-slate-400 via-white to-slate-400 border border-slate-300 rounded-full z-20"
            />
            <div className="w-6 h-8 bg-slate-300 rounded border border-slate-400 shadow-lg relative z-30" />
          </div>

          {/* Animated Driving Car */}
          <div
            style={{
              transition: isMoving ? 'left 0.7s ease-out, transform 0.5s, opacity 0.5s' : 'none',
            }}
            className={`absolute top-7 w-20 h-10 z-30 ${vehiclePosClass}`}
          >
            {renderTopDownCar(activeVehicle)}
          </div>
        </div>

        {/* Bottom Parking slots Grid (3 Slots) */}
        <div className="grid grid-cols-3 gap-5 w-full">
          {slotsConfig.filter(s => s.row === 'bottom').map(slot => {
            const isReservedOnly = reservedSlots.includes(slot.id);
            const occupiedVehicleType = occupiedSlots[slot.id];
            const isOccupied = !!occupiedVehicleType;

            let slotBorderClass = 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700';
            let statusLabel = 'FREE';
            let labelColor = 'text-emerald-700';

            if (isOccupied) {
              slotBorderClass = 'bg-red-50 border-red-400 shadow-inner text-red-700';
              statusLabel = 'OCCUPIED';
              labelColor = 'text-red-700';
            } else if (isReservedOnly) {
              slotBorderClass = 'bg-amber-50 border-amber-400 shadow-inner text-amber-700';
              statusLabel = 'RESERVED';
              labelColor = 'text-amber-700';
            }

            return (
              <div
                key={slot.id}
                className={`h-28 rounded-xl border-2 relative flex flex-col items-center justify-between p-3 transition-all duration-500 ${slotBorderClass}`}
              >
                {/* Yellow parking paint lines */}
                <div className="absolute left-0 bottom-0 top-0 w-1.5 bg-yellow-400/50" />
                <div className="absolute right-0 bottom-0 top-0 w-1.5 bg-yellow-400/50" />

                {isOccupied ? (
                  <div className="w-16 h-8 relative animate-fade-in">
                    {renderTopDownCar(occupiedVehicleType, true)}
                  </div>
                ) : isReservedOnly ? (
                  <span className="text-xs px-3 py-1 rounded border border-amber-400 bg-amber-100 text-amber-800 font-bold uppercase tracking-wider my-auto">
                    Reserved
                  </span>
                ) : (
                  <span className="text-xs tracking-wider uppercase font-bold text-slate-500 my-auto">Available</span>
                )}

                <div className="flex justify-between w-full text-xs font-bold font-mono">
                  <span>{slot.label}</span>
                  <span className={labelColor}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
