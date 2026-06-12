import type { ProgramNode, ASTNode, ConditionNode } from './ast';

export interface SimulationInputs {
  slotsCount: number;
  approachingVehicle: string;
}

export interface SimulationStep {
  stepNumber: number;
  sourceCommand: string;
  action: string;
  status: string;
  gateState: 'open' | 'closed';
  slotsReserved: string[];
  activeVehicle: 'normal' | 'VIP' | 'ambulance' | 'police' | 'firetruck' | null;
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
  inputs: SimulationInputs
): SimulationStep[] {
  const steps: SimulationStep[] = [];
  if (!ast) return [];

  // Track state throughout simulation
  let currentGateState: 'open' | 'closed' = 'closed';
  const currentSlots = new Set<string>();
  let currentActiveVehicle: 'normal' | 'VIP' | 'ambulance' | 'police' | 'firetruck' | null = null;
  let currentEmergencyOverride = false;

  let stepCounter = 1;

  // Add initial state step
  steps.push({
    stepNumber: 0,
    sourceCommand: `parking ${ast.zoneId} begin`,
    action: 'Initialize Zone',
    status: `Parking Zone '${ast.zoneId}' activated.`,
    gateState: currentGateState,
    slotsReserved: [],
    activeVehicle: null,
    emergencyOverride: false,
    sensorBlinking: false,
    sensorBlinkCount: 0,
    conditionResult: 'none',
    explanation: 'System initialized. Gate is closed, sensor is idle, no slots reserved.',
  });

  const evaluateCondition = (cond: ConditionNode): boolean => {
    if (cond.left === 'slots') {
      const actualSlots = inputs.slotsCount;
      const targetVal = cond.right as number;
      switch (cond.op) {
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
      const targetVal = cond.right as string;
      switch (cond.op) {
        case '==': return actualVehicle === targetVal;
        case '!=': return actualVehicle !== targetVal;
        default: return false;
      }
    }
  };

  const processStmt = (node: ASTNode, parentContextCommand?: string) => {
    const commandText = parentContextCommand || stringifyNode(node);

    switch (node.type) {
      case 'GateCommand': {
        currentGateState = node.action === 'open' ? 'open' : 'closed';
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: commandText,
          action: node.action === 'open' ? 'Open Gate' : 'Close Gate',
          status: `Gate set to ${node.action.toUpperCase()}`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: `Executes gate control command to ${node.action} the barrier.`,
        });
        break;
      }

      case 'SlotCommand': {
        if (node.action === 'reserve') {
          currentSlots.add(node.slotId);
        } else {
          currentSlots.delete(node.slotId);
        }
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: commandText,
          action: node.action === 'reserve' ? 'Reserve Slot' : 'Release Slot',
          status: `Slot ${node.slotId} ${node.action === 'reserve' ? 'Reserved' : 'Released'}`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: `Updates slot registry. Slot '${node.slotId}' is now ${node.action === 'reserve' ? 'occupied' : 'vacant'}.`,
        });
        break;
      }

      case 'SensorCheck': {
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: commandText,
          action: 'Check Sensor',
          status: 'Sensor scan triggered',
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: true,
          sensorBlinkCount: 1,
          conditionResult: 'none',
          explanation: 'Sensor scans the entrance lane to detect arriving vehicles.',
        });
        break;
      }

      case 'EmergencyOverride': {
        currentGateState = 'open';
        currentEmergencyOverride = true;
        currentActiveVehicle = node.emergencyType as any;
        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: commandText,
          action: 'Emergency Override',
          status: `Override Gate by ${node.emergencyType.toUpperCase()}`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: 'none',
          explanation: `🚨 EMERGENCY OVERRIDE! ${node.emergencyType.toUpperCase()} approaches. Priority safety protocols bypass normal gates and force barrier OPEN.`,
        });
        break;
      }

      case 'IfStatement': {
        const condVal = evaluateCondition(node.condition);
        const condResultStr = condVal ? 'true' : 'false';

        // Check if this condition is overridden by emergency priority downstream
        // (Just a nice semantic explanation for the presentation!)
        let priorityNote = '';
        if (
          node.condition.left === 'slots' &&
          node.condition.op === '==' &&
          node.condition.right === 0 &&
          node.thenStmt.type === 'GateCommand' &&
          node.thenStmt.action === 'close'
        ) {
          priorityNote = ' NOTE: Even if the gate closes due to 0 slots, emergency vehicles will override this action.';
        }

        steps.push({
          stepNumber: stepCounter++,
          sourceCommand: `if ${stringifyNode(node.condition)} then ...`,
          action: 'Evaluate Condition',
          status: `Condition evaluated to ${condResultStr.toUpperCase()}`,
          gateState: currentGateState,
          slotsReserved: Array.from(currentSlots),
          activeVehicle: currentActiveVehicle,
          emergencyOverride: currentEmergencyOverride,
          sensorBlinking: false,
          sensorBlinkCount: 0,
          conditionResult: condResultStr,
          explanation: `Evaluates if '${node.condition.left}' (${
            node.condition.left === 'slots' ? inputs.slotsCount : `'${inputs.approachingVehicle}'`
          }) matches condition '${node.condition.op} ${node.condition.right}'. Result: ${condResultStr.toUpperCase()}.${priorityNote}`,
        });

        if (condVal) {
          // Process inner statement but pass the full if command text for logging
          processStmt(node.thenStmt, commandText);
        }
        break;
      }

      case 'RepeatStatement': {
        // Flatten repeats into individual steps
        for (let i = 1; i <= node.count; i++) {
          if (node.stmt.type === 'SensorCheck') {
            steps.push({
              stepNumber: stepCounter++,
              sourceCommand: commandText,
              action: `Check Sensor (${i}/${node.count})`,
              status: `Repeat step ${i} completed`,
              gateState: currentGateState,
              slotsReserved: Array.from(currentSlots),
              activeVehicle: currentActiveVehicle,
              emergencyOverride: currentEmergencyOverride,
              sensorBlinking: true,
              sensorBlinkCount: i,
              conditionResult: 'none',
              explanation: `Loop repeat ${i} of ${node.count}: Scanning the zone sensors.`,
            });
          } else {
            // General support for other repeated commands
            processStmt(node.stmt, `${commandText} (Iteration ${i}/${node.count})`);
          }
        }
        break;
      }

      default:
        break;
    }
  };

  // Process all statements
  ast.stmts.forEach((stmt) => {
    processStmt(stmt);
  });

  // End zone step
  steps.push({
    stepNumber: stepCounter,
    sourceCommand: 'end',
    action: 'End Program',
    status: 'Simulation completed',
    gateState: currentGateState,
    slotsReserved: Array.from(currentSlots),
    activeVehicle: null,
    emergencyOverride: false,
    sensorBlinking: false,
    sensorBlinkCount: 0,
    conditionResult: 'none',
    explanation: 'ParkCommand program finished execution. Parking zone operates normally.',
  });

  return steps;
}
