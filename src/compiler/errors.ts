export type ErrorType = 'lexical' | 'syntax' | 'semantic';

export interface CompilerError {
  type: ErrorType;
  message: string;
  line: number;
  column: number;
  length?: number;
  badToken?: string;
  expected?: string;
  suggestion?: string;
}

export function createCompilerError(
  type: ErrorType,
  message: string,
  line: number,
  column: number,
  length?: number
): CompilerError {
  return { type, message, line, column, length };
}
