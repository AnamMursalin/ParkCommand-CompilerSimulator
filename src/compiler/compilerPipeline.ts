import { tokenize, Token, TokenType } from './lexer';
import { parse } from './parser';
import { analyzeSemantics } from './semanticAnalyzer';
import { SymbolTable } from './symbolTable';
import { compileToIRInstructions, ResolvedIRInstruction } from './intermediateCode';
import { CompilerError } from './errors';
import { ProgramNode } from './ast';

export interface CompileResult {
  tokens: Token[];
  ast: ProgramNode | null;
  symbolTable: SymbolTable;
  ir: string[];
  irInstructions: ResolvedIRInstruction[];
  errors: CompilerError[];
  success: boolean;
  failedPhase: 'lexer' | 'parser' | 'semantic' | null;
}

export function compileProgram(code: string): CompileResult {
  const result: CompileResult = {
    tokens: [],
    ast: null,
    symbolTable: new SymbolTable(),
    ir: [],
    irInstructions: [],
    errors: [],
    success: false,
    failedPhase: null,
  };

  // Phase 1: Lexical Analysis
  const lexResult = tokenize(code);
  result.tokens = lexResult.tokens;
  if (lexResult.errors.length > 0) {
    result.errors = lexResult.errors;
    result.failedPhase = 'lexer';
    return result;
  }

  // Phase 2: Syntax Analysis
  const parseResult = parse(lexResult.tokens);
  result.ast = parseResult.ast;
  if (parseResult.errors.length > 0) {
    result.errors = parseResult.errors;
    result.failedPhase = 'parser';
    return result;
  }

  // Phase 3: Semantic Analysis
  const semanticErrors = analyzeSemantics(parseResult.ast, result.symbolTable);
  if (semanticErrors.length > 0) {
    result.errors = semanticErrors;
    result.failedPhase = 'semantic';
    return result;
  }

  // Phase 4: Intermediate Code Generation
  if (parseResult.ast) {
    result.irInstructions = compileToIRInstructions(parseResult.ast);
    result.ir = result.irInstructions.map(i => i.text);
  }

  result.success = true;
  return result;
}
