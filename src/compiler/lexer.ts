import { CompilerError, createCompilerError } from './errors';

export type TokenType =
  | 'KEYWORD'     // parking, begin, end, if, then, repeat, times, emergency, override, slots, vehicle
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

const KEYWORDS = new Set(['parking', 'begin', 'end', 'if', 'then', 'repeat', 'times', 'emergency', 'override', 'slots', 'vehicle']);
const COMMANDS = new Set(['open', 'close', 'reserve', 'release', 'check']);
const OBJECTS = new Set(['gate', 'slot', 'sensor']);
const TYPES = new Set(['VIP', 'staff', 'visitor', 'ambulance', 'police', 'firetruck']);

const ALL_VALID_WORDS = [
  'parking', 'begin', 'end', 'if', 'then', 'repeat', 'times', 'emergency', 'override', 'slots', 'vehicle',
  'open', 'close', 'reserve', 'release', 'check',
  'gate', 'slot', 'sensor',
  'VIP', 'staff', 'visitor', 'ambulance', 'police', 'firetruck'
];

function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

export function getSpellingSuggestion(word: string): { expected: string; suggestion: string } | null {
  const lower = word.toLowerCase();
  if (lower.startsWith('checksens')) return { expected: 'check sensor', suggestion: "Add a space between 'check' and 'sensor'." };
  if (lower.startsWith('reservesl')) return { expected: 'reserve slot', suggestion: "Add a space between 'reserve' and 'slot'." };
  if (lower.startsWith('releasesl')) return { expected: 'release slot', suggestion: "Add a space between 'release' and 'slot'." };
  if (lower.startsWith('ifveh')) return { expected: 'if vehicle', suggestion: "Add a space between 'if' and 'vehicle'." };
  if (lower.startsWith('openg')) return { expected: 'open gate', suggestion: "Add a space between 'open' and 'gate'." };
  if (lower.startsWith('closeg')) return { expected: 'close gate', suggestion: "Add a space between 'close' and 'gate'." };
  if (lower.startsWith('thenopeng')) return { expected: 'then open gate', suggestion: "Add spaces between 'then', 'open', and 'gate'." };
  if (lower.startsWith('emergencyamb')) return { expected: 'emergency ambulance override gate', suggestion: "Add spaces between words." };
  return null;
}

export function findClosestWord(word: string): string | null {
  const lower = word.toLowerCase();
  
  // First, check prefix matching for shortcuts/abbreviations
  if (lower.length >= 1) {
    for (const valid of ALL_VALID_WORDS) {
      if (valid.toLowerCase().startsWith(lower)) {
        return valid;
      }
    }
  }

  let minDistance = Infinity;
  let closest: string | null = null;
  
  for (const valid of ALL_VALID_WORDS) {
    const dist = getLevenshteinDistance(lower, valid.toLowerCase());
    if (dist < minDistance && dist <= 2) {
      minDistance = dist;
      closest = valid;
    }
  }
  return closest;
}

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
      next();
      while (peek() !== null && peek() !== '\n') {
        next();
      }
      continue;
    }

    const startLine = line;
    const startCol = col;

    // Hyphen / Minus symbol (for negative repeat count integers)
    if (char === '-') {
      next();
      tokens.push({
        id: tokenId++,
        type: 'RELOP',
        value: '-',
        line: startLine,
        column: startCol,
      });
      continue;
    }

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
      let isValid = true;
      let errorMsg = '';
      let expected = '';
      let suggestion = '';

      if (KEYWORDS.has(word)) {
        type = 'KEYWORD';
      } else if (COMMANDS.has(word)) {
        type = 'COMMAND';
      } else if (OBJECTS.has(word)) {
        type = 'OBJECT';
      } else if (TYPES.has(word)) {
        type = 'TYPE';
      } else {
        // Context-aware check:
        // An arbitrary identifier is ONLY allowed immediately after "parking" or "slot"
        const isPrevDecl = tokens.length > 0 && (
          tokens[tokens.length - 1].value === 'parking' || 
          tokens[tokens.length - 1].value === 'slot'
        );

        if (!isPrevDecl) {
          isValid = false;
          const mergeCorrection = getSpellingSuggestion(word);
          if (mergeCorrection) {
            errorMsg = `Unknown command '${word}'.`;
            expected = mergeCorrection.expected;
            suggestion = mergeCorrection.suggestion;
          } else {
            const correction = findClosestWord(word);
            if (correction) {
              errorMsg = `Unknown command '${word}'.`;
              expected = correction;
              suggestion = `Did you mean '${correction}'?`;
            } else {
              errorMsg = `Unknown command or identifier '${word}'.`;
              expected = 'A valid keyword or command';
              suggestion = 'Check spelling or keyword layout.';
            }
          }
        }
      }

      if (!isValid) {
        const err = createCompilerError(
          'lexical',
          `Unknown command '${word}'.${suggestion ? ' ' + suggestion : ''}`,
          startLine,
          startCol,
          word.length
        );
        err.badToken = word;
        err.expected = expected || 'A valid command';
        err.suggestion = suggestion;
        errors.push(err);
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
