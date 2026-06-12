import type { ProgramNode, ASTNode, ConditionNode } from './ast';
import { ResolvedIRInstruction, compileToIRInstructions } from './intermediateCode';

export interface SimulationInputs {
  slotsCount: number;
  approachingVehicle: string;
}

export interface SimulationStep {
  stepNumber: number;
  sourceCommand: string;
  sourceLine: number; // Line number in source code
  action: string;
  status: string;
  gateState: 'open' | 'closed';
  slotsReserved: string[];
  slotsOccupied: Record<string, string>; // slotId -> vehicleType
  activeVehicle: string | null;
  emergencyOverride: boolean;
  sensorBlinking: boolean;
  sensorBlinkCount: number;
  conditionResult: 'true' | 'false' | 'none';
  explanation: string;
}

export function stringifyNode(node: ASTNode): string {
  switch (node.type) {
    case 'GateCommand':
      return `${node.action} gate`;
    case 'SlotCommand':
      return `${node.action} slot ${node.slotId}`;
    case 'SensorCheck':
      return 'check sensor';
    case 'EmergencyOverride':
      return `emergency ${node.emergencyType} override gate`;
    case 'IfStatement':
      return `if ${node.condition.left} ${node.condition.op} ${node.condition.right} then ${stringifyNode(node.thenStmt)}`;
    case 'RepeatStatement':
      return `repeat ${node.count} times ${stringifyNode(node.stmt)}`;
    case 'Condition':
      return `${node.left} ${node.op} ${node.right}`;
    default:
      return '';
  }
}

export function generateSimulationSteps(
  ast: ProgramNode | null,
  inputs: SimulationInputs,
  irInstructions?: ResolvedIRInstruction[]
): SimulationStep[] {
  if (!ast) return [];
  const instructions = irInstructions || compileToIRInstructions(ast);
  return generateSimulationStepsFromIR(instructions, inputs);
}

export function generateSimulationStepsFromIR(
  irInstructions: ResolvedIRInstruction[],
  inputs: SimulationInputs
): SimulationStep[] {
  const steps: SimulationStep[] = [];
  if (irInstructions.length === 0) return [];

  let currentGateState: 'open' | 'closed' = 'closed';
  const currentSlots = new Set<string>();
  const currentSlotsOccupied = new Map<string, string>();
  let currentActiveVehicle: string | null = null;
  let currentEmergencyOverride = false;

  let stepCounter = 0;
  let pc = 0;

  // Repeat loop tracking stack
  interface LoopFrame {
    count: number;
    currentIter: number;
    startPc: number;
  }
  const loopStack: LoopFrame[] = [];

  const evaluateCondition = (left: string, op: string, right: string): boolean => {
    if (left === 'slots') {
      const actualSlots = inputs.slotsCount;
      const targetVal = parseInt(right, 10);
      switch (op) {
        case '>': return actualSlots > targetVal;
        case '<': return actualSlots < targetVal;
        case '>=': return actualSlots >= targetVal;
        case '<=': return actualSlots <= targetVal;
        case '==': return actualSlots === targetVal;
        case '!=': return actualSlots !== targetVal;
        default: return false;
      }
    } else {
      const actualVehicle = inputs.approachingVehicle;
      switch (op) {
        case '==': return actualVehicle === right;
        case '!=': return actualVehicle !== right;
        default: return false;
      }
    }
  };

  while (pc < irInstructions.length) {
    const inst = irInstructions[pc];

    switch (inst.op) {
      case 'ZONE': {
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Initialize Zone',
          status: `Parking Zone '${inst.args[0]}' activated.`,
          gateState: currentGateState,
          slotsReserved: [],
          slotsOccupied: {},
          activeVehicle: null,
          emergencyOverride: false,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: 'System initialized. Gate is closed, sensor is idle, no slots reserved.',
        });
        pc++;
        break;
      }

      case 'GATE_OPEN': {
        currentGateState = 'open';
        if (inputs.approachingVehicle && inputs.approachingVehicle !== 'none') {
          currentActiveVehicle = inputs.approachingVehicle;
        }
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Open Gate',
          status: `Gate set to OPEN`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: 'Executes gate control command to open the barrier.',
        });
        pc++;
        break;
      }

      case 'GATE_CLOSE': {
        currentGateState = 'closed';
        currentActiveVehicle = null;
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Close Gate',
          status: `Gate set to CLOSED`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: 'Executes gate control command to close the barrier.',
        });
        pc++;
        break;
      }

      case 'RESERVE_SLOT': {
        const slotId = inst.args[0];
        if (currentActiveVehicle !== null) {
          currentSlotsOccupied.set(slotId, currentActiveVehicle);
        } else {
          currentSlots.add(slotId);
        }
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Reserve Slot',
          status: currentActiveVehicle !== null ? `Slot ${slotId} Occupied by ${currentActiveVehicle}` : `Slot ${slotId} Reserved`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: currentActiveVehicle !== null
            ? `Updates slot registry. Slot '${slotId}' is now occupied by the entering ${currentActiveVehicle} vehicle.`
            : `Updates slot registry. Slot '${slotId}' is reserved for future parking.`,
        });
        pc++;
        break;
      }

      case 'RELEASE_SLOT': {
        const slotId = inst.args[0];
        currentSlots.delete(slotId);
        currentSlotsOccupied.delete(slotId);
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Release Slot',
          status: `Slot ${slotId} Released`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: `Updates slot registry. Slot '${slotId}' is now vacant.`,
        });
        pc++;
        break;
      }

      case 'SENSOR_CHECK': {
        // Find if this SENSOR_CHECK is inside a REPEAT loop to show loop counter
        let iterStr = '';
        let blinkCount = 0;
        if (loopStack.length > 0) {
          const frame = loopStack[loopStack.length - 1];
          iterStr = ` (${frame.currentIter}/${frame.count})`;
          blinkCount = frame.currentIter;
        }

        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand + (iterStr ? ` (Iteration ${iterStr.trim()})` : ''),
          sourceLine: inst.line,
          action: `Check Sensor${iterStr}`,
          status: 'Sensor scan triggered',
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: true,
          sensorBlinkCount: blinkCount,
          conditionResult: 'none',
          explanation: 'Sensor scans the entrance lane to detect arriving vehicles.',
        });
        pc++;
        break;
      }

      case 'EMERGENCY_OVERRIDE': {
        const type = inst.args[0];
        currentGateState = 'open';
        currentEmergencyOverride = true;
        currentActiveVehicle = type;

        let priorityExplanation = `🚨 EMERGENCY OVERRIDE! ${type.toUpperCase()} approaches. Priority safety protocols bypass normal gates and force barrier OPEN.`;
        if (inputs.slotsCount === 0) {
          priorityExplanation += ` Emergency override has higher priority, so ${type} can open the gate even when parking is full (0 available slots).`;
        }

        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Emergency Override',
          status: `Override Gate by ${type.toUpperCase()}`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: priorityExplanation,
        });
        pc++;
        break;
      }

      case 'REPEAT_START': {
        const count = parseInt(inst.args[0], 10);
        loopStack.push({
          count,
          currentIter: 1,
          startPc: pc + 1
        });
        pc++;
        break;
      }

      case 'REPEAT_END': {
        if (loopStack.length > 0) {
          const frame = loopStack[loopStack.length - 1];
          if (frame.currentIter < frame.count) {
            frame.currentIter++;
            pc = frame.startPc;
          } else {
            loopStack.pop();
            pc++;
          }
        } else {
          pc++;
        }
        break;
      }

      case 'IF_GOTO': {
        const left = inst.args[0];
        const op = inst.args[1];
        const right = inst.args[2];
        const condVal = evaluateCondition(left, op, right);
        const condResultStr = condVal ? 'true' : 'false';

        let priorityNote = '';
        if (
          left === 'slots' &&
          op === '==' &&
          right === '0'
        ) {
          priorityNote = ' NOTE: Even if the gate closes due to 0 slots, emergency vehicles will override this action.';
        }

        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'Evaluate Condition',
          status: `Condition evaluated to ${condResultStr.toUpperCase()}`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: condResultStr,
          explanation: `Evaluates if '${left}' (${
            left === 'slots' ? inputs.slotsCount : `'${inputs.approachingVehicle}'`
          }) matches condition '${op} ${right}'. Result: ${condResultStr.toUpperCase()}.${priorityNote}`,
        });

        if (condVal) {
          pc = inst.targetPc ?? (pc + 1);
        } else {
          pc++;
        }
        break;
      }

      case 'GOTO': {
        pc = inst.targetPc ?? (pc + 1);
        break;
      }

      case 'LABEL': {
        pc++;
        break;
      }

      case 'END_ZONE': {
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: inst.sourceCommand,
          sourceLine: inst.line,
          action: 'End Program',
          status: 'Simulation completed',
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          slotsOccupied: Object.fromEntries(currentSlotsOccupied),
          activeVehicle: null,
          emergencyOverride: false,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: 'ParkCommand program finished execution. Parking zone operates normally.',
        });
        pc++;
        break;
      }

      default: {
        pc++;
        break;
      }
    }
  }

  return steps;
}
