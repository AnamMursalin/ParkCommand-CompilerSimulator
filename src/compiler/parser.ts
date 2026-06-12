import { Token, TokenType } from './lexer';
import { CompilerError, createCompilerError } from './errors';
import {
  ASTNode,
  ProgramNode,
  GateCommandNode,
  SlotCommandNode,
  IfStatementNode,
  ConditionNode,
  RepeatStatementNode,
  EmergencyOverrideNode,
  SensorCheckNode,
} from './ast';

class ParseError extends Error {}

export function parse(tokens: Token[]): { ast: ProgramNode | null; errors: CompilerError[] } {
  let idx = 0;
  const errors: CompilerError[] = [];

  const peek = (): Token => {
    if (idx < tokens.length) return tokens[idx];
    return tokens[tokens.length - 1]; // Return EOF
  };

  const next = (): Token => {
    const t = peek();
    if (idx < tokens.length) idx++;
    return t;
  };

  const match = (type: TokenType, value?: string): Token | null => {
    const t = peek();
    if (t.type === type && (value === undefined || t.value === value)) {
      return next();
    }
    return null;
  };

  const expect = (type: TokenType, value?: string, errorMsg?: string): Token => {
    const t = peek();
    if (t.type === type && (value === undefined || t.value === value)) {
      return next();
    }

    const expectedStr = value ? `'${value}'` : type;
    const actualStr = t.type === 'EOF' ? 'end of file' : `'${t.value}'`;
    const message = errorMsg || `Expected ${expectedStr} but found ${actualStr}.`;
    
    const err = createCompilerError('syntax', message, t.line, t.column, t.value.length);
    errors.push(err);
    throw new ParseError(message);
  };

  // Error recovery helper
  const synchronize = () => {
    next(); // Skip the offending token
    while (idx < tokens.length) {
      const t = peek();
      if (t.type === 'EOF') break;
      // Synchronize at statements or block ends
      if (
        t.value === 'end' ||
        t.value === 'open' ||
        t.value === 'close' ||
        t.value === 'reserve' ||
        t.value === 'release' ||
        t.value === 'if' ||
        t.value === 'repeat' ||
        t.value === 'emergency' ||
        t.value === 'check' ||
        t.value === 'begin'
      ) {
        break;
      }
      next();
    }
  };

  const parseProgram = (): ProgramNode | null => {
    try {
      const parkToken = expect('KEYWORD', 'parking', "Expected 'parking' at the start of the program.");
      const zoneToken = expect('IDENTIFIER', undefined, 'Expected parking zone name identifier.');
      
      const nextT = peek();
      if (nextT.value !== 'begin') {
        // Precise error format requested: Syntax Error at line 1, column 18: Expected 'begin' after parking zone name.
        const errCol = zoneToken.column + zoneToken.value.length + 1;
        const err = createCompilerError(
          'syntax',
          `Expected 'begin' after parking zone name.`,
          zoneToken.line,
          errCol,
          5
        );
        errors.push(err);
        // Throw to try and recover
        throw new ParseError(`Expected 'begin'`);
      }
      next(); // Consume 'begin'

      const stmts = parseStmtList();
      expect('KEYWORD', 'end', "Expected 'end' at the end of the parking program block.");

      return {
        type: 'Program',
        zoneId: zoneToken.value,
        stmts,
        line: parkToken.line,
        column: parkToken.column,
      };
    } catch (e) {
      if (e instanceof ParseError) {
        // Attempt high level recover
        return null;
      }
      throw e;
    }
  };

  const parseStmtList = (): ASTNode[] => {
    const stmts: ASTNode[] = [];
    while (idx < tokens.length) {
      const t = peek();
      if (t.type === 'EOF' || t.value === 'end') {
        break;
      }
      
      const stmt = parseStmt();
      if (stmt) {
        stmts.push(stmt);
      }
    }
    return stmts;
  };

  const parseStmt = (): ASTNode | null => {
    const t = peek();
    try {
      if (t.type === 'COMMAND' && (t.value === 'open' || t.value === 'close')) {
        return parseGateCmd();
      } else if (t.type === 'COMMAND' && (t.value === 'reserve' || t.value === 'release')) {
        return parseSlotCmd();
      } else if (t.type === 'KEYWORD' && t.value === 'if') {
        return parseIfStmt();
      } else if (t.type === 'KEYWORD' && t.value === 'repeat') {
        return parseRepeatStmt();
      } else if (t.type === 'KEYWORD' && t.value === 'emergency') {
        return parseEmergencyStmt();
      } else if (t.type === 'COMMAND' && t.value === 'check') {
        return parseSensorCmd();
      } else {
        const err = createCompilerError(
          'syntax',
          `Unexpected token '${t.value}'. Expected a valid command (open, close, reserve, release, check, repeat, emergency, if) or 'end'.`,
          t.line,
          t.column,
          t.value.length
        );
        errors.push(err);
        synchronize();
        return null;
      }
    } catch (e) {
      if (e instanceof ParseError) {
        synchronize();
        return null;
      }
      throw e;
    }
  };

  const parseGateCmd = (): GateCommandNode => {
    const cmdToken = next(); // open or close
    const action = cmdToken.value as 'open' | 'close';
    expect('OBJECT', 'gate', `Expected 'gate' after '${action}'.`);
    return {
      type: 'GateCommand',
      action,
      line: cmdToken.line,
      column: cmdToken.column,
    };
  };

  const parseSlotCmd = (): SlotCommandNode => {
    const cmdToken = next(); // reserve or release
    const action = cmdToken.value as 'reserve' | 'release';
    expect('OBJECT', 'slot', `Expected 'slot' after '${action}'.`);
    
    const idToken = peek();
    if (idToken.type === 'IDENTIFIER' || idToken.type === 'TYPE' || idToken.type === 'NUMBER') {
      next(); // Consume slot id
      return {
        type: 'SlotCommand',
        action,
        slotId: idToken.value,
        line: cmdToken.line,
        column: cmdToken.column,
      };
    } else {
      const err = createCompilerError(
        'syntax',
        `Expected slot identifier after 'slot' but found '${idToken.value}'.`,
        idToken.line,
        idToken.column,
        idToken.value.length
      );
      errors.push(err);
      throw new ParseError();
    }
  };

  const parseIfStmt = (): IfStatementNode => {
    const ifToken = next(); // 'if'
    const condition = parseCondition();
    expect('KEYWORD', 'then', "Expected 'then' after if condition.");
    const thenStmt = parseStmt();
    if (!thenStmt) {
      const t = peek();
      const err = createCompilerError(
        'syntax',
        `Expected statement after 'then'.`,
        t.line,
        t.column,
        t.value.length
      );
      errors.push(err);
      throw new ParseError();
    }
    return {
      type: 'IfStatement',
      condition,
      thenStmt,
      line: ifToken.line,
      column: ifToken.column,
    };
  };

  const parseCondition = (): ConditionNode => {
    const t = peek();
    if (t.value === 'slots') {
      const slotsToken = next();
      const opToken = expect('RELOP', undefined, "Expected relational operator (>, <, >=, <=, ==, !=) after 'slots'.");
      
      const valToken = peek();
      if (valToken.type === 'NUMBER') {
        next();
        return {
          type: 'Condition',
          left: 'slots',
          op: opToken.value,
          right: parseInt(valToken.value, 10),
          line: slotsToken.line,
          column: slotsToken.column,
        };
      } else {
        // Specific output: Syntax Error at line 2: Expected number after relational operator '>'.
        const err = createCompilerError(
          'syntax',
          `Expected number after relational operator '${opToken.value}'.`,
          valToken.line,
          valToken.column,
          valToken.value.length
        );
        errors.push(err);
        throw new ParseError();
      }
    } else if (t.value === 'vehicle') {
      const vehicleToken = next();
      const opToken = expect('RELOP', undefined, "Expected relational operator (>, <, >=, <=, ==, !=) after 'vehicle'.");
      
      // Let's accept any IDENTIFIER or TYPE for VehicleType
      const valToken = peek();
      if (valToken.type === 'TYPE' || valToken.type === 'IDENTIFIER') {
        next();
        return {
          type: 'Condition',
          left: 'vehicle',
          op: opToken.value,
          right: valToken.value,
          line: vehicleToken.line,
          column: vehicleToken.column,
        };
      } else {
        const err = createCompilerError(
          'syntax',
          `Expected vehicle type after relational operator '${opToken.value}'.`,
          valToken.line,
          valToken.column,
          valToken.value.length
        );
        errors.push(err);
        throw new ParseError();
      }
    } else {
      const err = createCompilerError(
        'syntax',
        `Expected 'slots' or 'vehicle' in condition, but found '${t.value}'.`,
        t.line,
        t.column,
        t.value.length
      );
      errors.push(err);
      throw new ParseError();
    }
  };

  const parseRepeatStmt = (): RepeatStatementNode => {
    const repeatToken = next(); // 'repeat'
    const countToken = expect('NUMBER', undefined, "Expected repeat count number after 'repeat'.");
    expect('KEYWORD', 'times', "Expected 'times' after repeat count.");
    const stmt = parseStmt();
    if (!stmt) {
      const t = peek();
      const err = createCompilerError(
        'syntax',
        `Expected statement after 'times'.`,
        t.line,
        t.column,
        t.value.length
      );
      errors.push(err);
      throw new ParseError();
    }
    return {
      type: 'RepeatStatement',
      count: parseInt(countToken.value, 10),
      stmt,
      line: repeatToken.line,
      column: repeatToken.column,
    };
  };

  const parseSensorCmd = (): SensorCheckNode => {
    const checkToken = next(); // 'check'
    expect('OBJECT', 'sensor', "Expected 'sensor' after 'check'.");
    return {
      type: 'SensorCheck',
      line: checkToken.line,
      column: checkToken.column,
    };
  };

  const parseEmergencyStmt = (): EmergencyOverrideNode => {
    const emToken = next(); // 'emergency'
    
    // Read EmergencyType: accept any TYPE or IDENTIFIER in parser so we can raise semantic error
    const typeToken = peek();
    if (typeToken.type === 'TYPE' || typeToken.type === 'IDENTIFIER') {
      next(); // Consume type
      expect('KEYWORD', 'override', "Expected 'override' after emergency vehicle type.");
      expect('OBJECT', 'gate', "Expected 'gate' after 'override'.");
      return {
        type: 'EmergencyOverride',
        emergencyType: typeToken.value,
        line: emToken.line,
        column: emToken.column,
      };
    } else {
      const err = createCompilerError(
        'syntax',
        `Expected emergency vehicle type after 'emergency' but found '${typeToken.value}'.`,
        typeToken.line,
        typeToken.column,
        typeToken.value.length
      );
      errors.push(err);
      throw new ParseError();
    }
  };

  const ast = parseProgram();

  return { ast, errors };
}
