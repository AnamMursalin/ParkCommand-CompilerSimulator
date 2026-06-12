import { CompilerError, createCompilerError } from './errors';

export type TokenType =
  | 'KEYWORD'     // parking, begin, end, if, then, repeat, times, emergency, override
  | 'COMMAND'     // open, close, reserve, release, check
  | 'OBJECT'      // gate, slot, sensor
  | 'RELOP'       // >, <, >=, <=, ==, !=
  | 'TYPE'        // VIP, staff, visitor, ambulance, police, firetruck
  | 'IDENTIFIER'  // MallZone, VIP_A1, STAFF_B2, etc.
  | 'NUMBER'      // 20, 2, etc.
  | 'EOF';

export interface Token {
  id: number;
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set(['parking', 'begin', 'end', 'if', 'then', 'repeat', 'times', 'emergency', 'override']);
const COMMANDS = new Set(['open', 'close', 'reserve', 'release', 'check']);
const OBJECTS = new Set(['gate', 'slot', 'sensor']);
const TYPES = new Set(['VIP', 'staff', 'visitor', 'ambulance', 'police', 'firetruck']);

export function tokenize(source: string): { tokens: Token[]; errors: CompilerError[] } {
  const tokens: Token[] = [];
  const errors: CompilerError[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;
  let tokenId = 1;

  const peek = () => (pos < source.length ? source[pos] : null);
  const next = () => {
    const char = source[pos++];
    if (char === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return char;
  };

  while (pos < source.length) {
    const char = peek();

    if (char === null) break;

    // Skip whitespace
    if (/\s/.test(char)) {
      next();
      continue;
    }

    // Skip comments starting with '#'
    if (char === '#') {
      // Consume '#'
      next();
      while (peek() !== null && peek() !== '\n') {
        next();
      }
      continue;
    }

    const startLine = line;
    const startCol = col;

    // Relational Operators: >=, <=, ==, !=, >, <
    if (char === '=' || char === '!' || char === '>' || char === '<') {
      let op = next();
      if (op === '=' && peek() === '=') {
        op += next();
      } else if (op === '!' && peek() === '=') {
        op += next();
      } else if (op === '>' && peek() === '=') {
        op += next();
      } else if (op === '<' && peek() === '=') {
        op += next();
      }
      tokens.push({
        id: tokenId++,
        type: 'RELOP',
        value: op,
        line: startLine,
        column: startCol,
      });
      continue;
    }

    // Numbers: digits only
    if (/\d/.test(char)) {
      let numStr = '';
      while (peek() !== null && /\d/.test(peek()!)) {
        numStr += next();
      }
      tokens.push({
        id: tokenId++,
        type: 'NUMBER',
        value: numStr,
        line: startLine,
        column: startCol,
      });
      continue;
    }

    // Identifiers, Keywords, Commands, and Types
    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (peek() !== null && /[a-zA-Z0-9_]/.test(peek()!)) {
        word += next();
      }

      let type: TokenType = 'IDENTIFIER';
      if (KEYWORDS.has(word)) {
        type = 'KEYWORD';
      } else if (COMMANDS.has(word)) {
        type = 'COMMAND';
      } else if (OBJECTS.has(word)) {
        type = 'OBJECT';
      } else if (TYPES.has(word)) {
        type = 'TYPE';
      }

      tokens.push({
        id: tokenId++,
        type,
        value: word,
        line: startLine,
        column: startCol,
      });
      continue;
    }

    // Unrecognized character
    errors.push(
      createCompilerError(
        'lexical',
        `Unrecognized character '${char}'`,
        line,
        col,
        1
      )
    );
    next();
  }

  // Append EOF token
  tokens.push({
    id: tokenId++,
    type: 'EOF',
    value: 'EOF',
    line,
    column: col,
  });

  return { tokens, errors };
}
