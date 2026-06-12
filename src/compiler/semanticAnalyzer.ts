import { ASTNode, ProgramNode } from './ast';
import { CompilerError, createCompilerError } from './errors';
import { SymbolTable } from './symbolTable';

const ALLOWED_VEHICLES = new Set(['VIP', 'staff', 'visitor', 'ambulance', 'police', 'firetruck']);
const ALLOWED_EMERGENCY = new Set(['ambulance', 'police', 'firetruck']);

export function analyzeSemantics(
  ast: ProgramNode | null,
  symbolTable: SymbolTable
): CompilerError[] {
  const errors: CompilerError[] = [];
  symbolTable.clear();

  if (!ast) {
    errors.push(
      createCompilerError(
        'semantic',
        'Program structure is missing or contains fatal syntax errors.',
        1,
        1,
        1
      )
    );
    return errors;
  }

  // Set the zone name
  symbolTable.setZone(ast.zoneId, ast.line);

  // Helper to recursively analyze nodes
  const visit = (node: ASTNode) => {
    switch (node.type) {
      case 'GateCommand':
        symbolTable.setGate(node.action, node.line);
        break;

      case 'SlotCommand':
        if (node.action === 'reserve') {
          if (symbolTable.reservedSlots.has(node.slotId)) {
            errors.push(
              createCompilerError(
                'semantic',
                `Slot ${node.slotId} is already reserved.`,
                node.line,
                node.column
              )
            );
          } else {
            symbolTable.reserveSlot(node.slotId, node.line);
          }
        } else if (node.action === 'release') {
          if (!symbolTable.reservedSlots.has(node.slotId)) {
            errors.push(
              createCompilerError(
                'semantic',
                `Slot ${node.slotId} cannot be released because it is not reserved.`,
                node.line,
                node.column
              )
            );
          } else {
            symbolTable.releaseSlot(node.slotId, node.line);
          }
        }
        break;

      case 'IfStatement':
        // Analyze condition
        if (node.condition.left === 'vehicle') {
          const vType = String(node.condition.right);
          if (!ALLOWED_VEHICLES.has(vType)) {
            errors.push(
              createCompilerError(
                'semantic',
                `Invalid vehicle category '${vType}'. Allowed types: VIP, staff, visitor, ambulance, police, firetruck.`,
                node.condition.line,
                node.condition.column
              )
            );
          } else {
            symbolTable.addVehicleCheck(vType, node.condition.line);
          }
        }
        // Analyze statement
        visit(node.thenStmt);
        break;

      case 'RepeatStatement':
        if (node.count <= 0) {
          errors.push(
            createCompilerError(
              'semantic',
              `Repeat count must be greater than zero. Found: ${node.count}.`,
              node.line,
              node.column
            )
          );
        }
        // Analyze inner statement
        visit(node.stmt);
        break;

      case 'EmergencyOverride':
        if (!ALLOWED_EMERGENCY.has(node.emergencyType)) {
          // Specific output: Semantic Error at line 2: Invalid emergency vehicle type 'visitor'. Only ambulance, police, and firetruck are allowed.
          errors.push(
            createCompilerError(
              'semantic',
              `Invalid emergency vehicle type '${node.emergencyType}'. Only ambulance, police, and firetruck are allowed.`,
              node.line,
              node.column
            )
          );
        } else {
          symbolTable.addEmergencyOverride(node.emergencyType, node.line);
        }
        break;

      case 'SensorCheck':
        symbolTable.addSensorCheck(1, node.line);
        break;

      default:
        break;
    }
  };

  // Traverse all statement list
  ast.stmts.forEach((stmt) => {
    visit(stmt);
  });

  return errors;
}
