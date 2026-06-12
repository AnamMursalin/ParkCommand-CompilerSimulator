import { ProgramNode, ASTNode } from './ast';

export function generateIntermediateCode(ast: ProgramNode | null): string[] {
  if (!ast) return [];

  const ir: string[] = [];
  let labelIdx = 1;

  const nextLabel = () => `L${labelIdx++}`;

  const translateStmt = (node: ASTNode) => {
    switch (node.type) {
      case 'GateCommand':
        ir.push(node.action === 'open' ? 'GATE_OPEN' : 'GATE_CLOSE');
        break;

      case 'SlotCommand':
        ir.push(
          `${node.action === 'reserve' ? 'RESERVE_SLOT' : 'RELEASE_SLOT'} ${node.slotId}`
        );
        break;

      case 'SensorCheck':
        ir.push('SENSOR_CHECK');
        break;

      case 'EmergencyOverride':
        ir.push(`EMERGENCY_OVERRIDE ${node.emergencyType} gate`);
        break;

      case 'RepeatStatement': {
        // We look at what statement is inside. E.g. check sensor -> SENSOR_CHECK
        const innerIR: string[] = [];
        // Temporarily intercept IR generation for the sub-statement
        const tempIR = generateSubStmtIR(node.stmt);
        if (tempIR.length > 0) {
          ir.push(`REPEAT ${node.count} ${tempIR.join(', ')}`);
        }
        break;
      }

      case 'IfStatement': {
        const cond = node.condition;
        const condStr = `${cond.left} ${cond.op} ${cond.right}`;
        const trueLabel = nextLabel();
        const falseLabel = nextLabel();

        ir.push(`IF ${condStr} GOTO ${trueLabel}`);
        ir.push(`GOTO ${falseLabel}`);
        ir.push(`${trueLabel}:`);
        
        // Translate the inner then-stmt
        translateStmt(node.thenStmt);
        
        ir.push(`${falseLabel}:`);
        break;
      }

      default:
        break;
    }
  };

  const generateSubStmtIR = (node: ASTNode): string[] => {
    const subIR: string[] = [];
    switch (node.type) {
      case 'GateCommand':
        subIR.push(node.action === 'open' ? 'GATE_OPEN' : 'GATE_CLOSE');
        break;
      case 'SlotCommand':
        subIR.push(
          `${node.action === 'reserve' ? 'RESERVE_SLOT' : 'RELEASE_SLOT'} ${node.slotId}`
        );
        break;
      case 'SensorCheck':
        subIR.push('SENSOR_CHECK');
        break;
      case 'EmergencyOverride':
        subIR.push(`EMERGENCY_OVERRIDE ${node.emergencyType} gate`);
        break;
      default:
        // Complex nesting is supported, but simple commands are standard
        break;
    }
    return subIR;
  };

  ir.push(`ZONE ${ast.zoneId}`);
  ast.stmts.forEach((stmt) => {
    translateStmt(stmt);
  });
  ir.push('END_ZONE');

  return ir;
}
