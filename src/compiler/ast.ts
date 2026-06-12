export type ASTNode =
  | ProgramNode
  | GateCommandNode
  | SlotCommandNode
  | IfStatementNode
  | ConditionNode
  | RepeatStatementNode
  | EmergencyOverrideNode
  | SensorCheckNode;

export interface BaseASTNode {
  type: string;
  line: number;
  column: number;
}

export interface ProgramNode extends BaseASTNode {
  type: 'Program';
  zoneId: string;
  stmts: ASTNode[];
}

export interface GateCommandNode extends BaseASTNode {
  type: 'GateCommand';
  action: 'open' | 'close';
}

export interface SlotCommandNode extends BaseASTNode {
  type: 'SlotCommand';
  action: 'reserve' | 'release';
  slotId: string;
}

export interface ConditionNode extends BaseASTNode {
  type: 'Condition';
  left: 'slots' | 'vehicle';
  op: string;
  right: string | number; // number for slots, vehicle type for vehicle
}

export interface IfStatementNode extends BaseASTNode {
  type: 'IfStatement';
  condition: ConditionNode;
  thenStmt: ASTNode;
}

export interface RepeatStatementNode extends BaseASTNode {
  type: 'RepeatStatement';
  count: number;
  stmt: ASTNode;
}

export interface EmergencyOverrideNode extends BaseASTNode {
  type: 'EmergencyOverride';
  emergencyType: 'ambulance' | 'police' | 'firetruck' | string; // Use string to handle semantic error detection for invalid types
}

export interface SensorCheckNode extends BaseASTNode {
  type: 'SensorCheck';
}
