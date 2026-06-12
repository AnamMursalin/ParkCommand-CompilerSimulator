import { ProgramNode, ASTNode } from './ast';

export interface IRInstruction {
  text: string;
  op: string;
  args: string[];
  line: number;
  sourceCommand: string;
}

export interface ResolvedIRInstruction extends IRInstruction {
  targetPc?: number;
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

export function resolveLabels(instructions: IRInstruction[]): ResolvedIRInstruction[] {
  const resolved: ResolvedIRInstruction[] = instructions.map(i => ({ ...i }));
  const labelMap: { [labelName: string]: number } = {};

  // Pass 1: Collect label indices
  resolved.forEach((inst, idx) => {
    if (inst.op === 'LABEL') {
      const labelName = inst.args[0];
      labelMap[labelName] = idx;
    }
  });

  // Pass 2: Resolve jump targets to absolute instruction indices
  resolved.forEach((inst) => {
    if (inst.op === 'GOTO') {
      const labelName = inst.args[0];
      if (labelName in labelMap) {
        inst.targetPc = labelMap[labelName];
      }
    } else if (inst.op === 'IF_GOTO') {
      const labelName = inst.args[3];
      if (labelName in labelMap) {
        inst.targetPc = labelMap[labelName];
      }
    }
  });

  return resolved;
}

export function compileToIRInstructions(ast: ProgramNode | null): ResolvedIRInstruction[] {
  if (!ast) return [];

  const irInstructions: IRInstruction[] = [];
  let labelIdx = 1;

  const nextLabel = () => `L${labelIdx++}`;

  const translateStmt = (node: ASTNode) => {
    const line = node.line;
    const sourceCommand = stringifyNode(node);

    switch (node.type) {
      case 'GateCommand':
        irInstructions.push({
          op: node.action === 'open' ? 'GATE_OPEN' : 'GATE_CLOSE',
          args: [],
          text: node.action === 'open' ? 'GATE_OPEN' : 'GATE_CLOSE',
          line,
          sourceCommand,
        });
        break;

      case 'SlotCommand':
        irInstructions.push({
          op: node.action === 'reserve' ? 'RESERVE_SLOT' : 'RELEASE_SLOT',
          args: [node.slotId],
          text: `${node.action === 'reserve' ? 'RESERVE_SLOT' : 'RELEASE_SLOT'} ${node.slotId}`,
          line,
          sourceCommand,
        });
        break;

      case 'SensorCheck':
        irInstructions.push({
          op: 'SENSOR_CHECK',
          args: [],
          text: 'SENSOR_CHECK',
          line,
          sourceCommand,
        });
        break;

      case 'EmergencyOverride':
        irInstructions.push({
          op: 'EMERGENCY_OVERRIDE',
          args: [node.emergencyType],
          text: `EMERGENCY_OVERRIDE ${node.emergencyType} gate`,
          line,
          sourceCommand,
        });
        break;

      case 'RepeatStatement': {
        irInstructions.push({
          op: 'REPEAT_START',
          args: [String(node.count)],
          text: `REPEAT_START ${node.count}`,
          line,
          sourceCommand,
        });

        // Translate the inner loop statement
        translateStmt(node.stmt);

        irInstructions.push({
          op: 'REPEAT_END',
          args: [],
          text: `REPEAT_END`,
          line,
          sourceCommand,
        });
        break;
      }

      case 'IfStatement': {
        const cond = node.condition;
        const condStr = `${cond.left} ${cond.op} ${cond.right}`;
        const trueLabel = nextLabel();
        const falseLabel = nextLabel();

        irInstructions.push({
          op: 'IF_GOTO',
          args: [cond.left, cond.op, String(cond.right), trueLabel],
          text: `IF ${condStr} GOTO ${trueLabel}`,
          line: cond.line,
          sourceCommand: `if ${condStr} then ...`,
        });

        irInstructions.push({
          op: 'GOTO',
          args: [falseLabel],
          text: `GOTO ${falseLabel}`,
          line: cond.line,
          sourceCommand: `if ${condStr} then ...`,
        });

        irInstructions.push({
          op: 'LABEL',
          args: [trueLabel],
          text: `${trueLabel}:`,
          line: node.thenStmt.line,
          sourceCommand: sourceCommand,
        });

        translateStmt(node.thenStmt);

        irInstructions.push({
          op: 'LABEL',
          args: [falseLabel],
          text: `${falseLabel}:`,
          line: node.thenStmt.line + 1,
          sourceCommand: sourceCommand,
        });
        break;
      }

      default:
        break;
    }
  };

  irInstructions.push({
    op: 'ZONE',
    args: [ast.zoneId],
    text: `ZONE ${ast.zoneId}`,
    line: ast.line,
    sourceCommand: `parking ${ast.zoneId} begin`,
  });

  ast.stmts.forEach((stmt) => {
    translateStmt(stmt);
  });

  irInstructions.push({
    op: 'END_ZONE',
    args: [],
    text: 'END_ZONE',
    line: ast.stmts[ast.stmts.length - 1]?.line + 1 || ast.line + 1,
    sourceCommand: 'end',
  });

  return resolveLabels(irInstructions);
}

export function generateIntermediateCode(ast: ProgramNode | null): string[] {
  return compileToIRInstructions(ast).map(inst => inst.text);
}
