import { tokenize } from './lexer';
import { parse } from './parser';
import { analyzeSemantics } from './semanticAnalyzer';
import { SymbolTable } from './symbolTable';

export interface TestResult {
  name: string;
  phase: 'Lexer' | 'Parser' | 'Semantic';
  status: 'Passed' | 'Failed';
  message?: string;
}

export function runCompilerTests(): TestResult[] {
  const results: TestResult[] = [];

  // Helper to run a test
  const addResult = (name: string, phase: 'Lexer' | 'Parser' | 'Semantic', passed: boolean, message?: string) => {
    results.push({
      name,
      phase,
      status: passed ? 'Passed' : 'Failed',
      message: passed ? undefined : message,
    });
  };

  // --- LEXER TESTS ---
  try {
    const lexSource = 'parking begin end open gate reserve slot';
    const { tokens, errors } = tokenize(lexSource);
    // Should recognize 7 tokens + EOF = 8
    const passed = tokens.length === 8 && errors.length === 0;
    addResult(
      'Should correctly tokenize valid keywords and commands',
      'Lexer',
      passed,
      `Expected 8 tokens, got ${tokens.length}. Errors: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Tokenization exception test', 'Lexer', false, e.message);
  }

  try {
    const lexSource = 'parking MallZone $';
    const { errors } = tokenize(lexSource);
    const passed = errors.length === 1 && errors[0].message.includes("Unrecognized character '$'");
    addResult(
      'Should report lexical error on illegal character',
      'Lexer',
      passed,
      'Expected 1 lexical error about unrecognized character.'
    );
  } catch (e: any) {
    addResult('Tokenization error reporting exception', 'Lexer', false, e.message);
  }

  // --- PARSER TESTS ---
  try {
    const parseSource = 'parking ZoneA begin open gate end';
    const { tokens } = tokenize(parseSource);
    const { ast, errors } = parse(tokens);
    const passed = ast !== null && ast.zoneId === 'ZoneA' && ast.stmts.length === 1 && errors.length === 0;
    addResult(
      'Should parse standard block with single statement',
      'Parser',
      passed,
      `AST is null or malformed. Errors: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Parsing validation exception', 'Parser', false, e.message);
  }

  try {
    const parseSource = 'parking ZoneA open gate end';
    const { tokens } = tokenize(parseSource);
    const { errors } = parse(tokens);
    // Should fail because of missing begin
    const passed = errors.length > 0 && errors.some(e => e.message.includes("begin"));
    addResult(
      'Should fail syntax analysis if begin clause is omitted',
      'Parser',
      passed,
      'Expected syntax error about missing begin clause.'
    );
  } catch (e: any) {
    addResult('Missing begin syntax check exception', 'Parser', false, e.message);
  }

  // --- SEMANTIC TESTS ---
  try {
    const semanticSource = `parking ZoneB begin
      reserve slot VIP_1
      reserve slot VIP_1
    end`;
    const lex = tokenize(semanticSource);
    const p = parse(lex.tokens);
    const table = new SymbolTable();
    const errors = analyzeSemantics(p.ast, table);
    const passed = errors.length === 1 && errors[0].message.includes('VIP_1 is already reserved');
    addResult(
      'Should detect duplicate slot reservations semantically',
      'Semantic',
      passed,
      `Expected duplicate slot error. Got: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Duplicate reservation check exception', 'Semantic', false, e.message);
  }

  try {
    const semanticSource = `parking ZoneC begin
      release slot STAFF_1
    end`;
    const lex = tokenize(semanticSource);
    const p = parse(lex.tokens);
    const table = new SymbolTable();
    const errors = analyzeSemantics(p.ast, table);
    const passed = errors.length === 1 && errors[0].message.includes('is not reserved');
    addResult(
      'Should detect releasing unreserved slots',
      'Semantic',
      passed,
      `Expected unreserved release error. Got: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Unreserved release check exception', 'Semantic', false, e.message);
  }

  try {
    const semanticSource = `parking ZoneD begin
      repeat 0 times check sensor
    end`;
    const lex = tokenize(semanticSource);
    const p = parse(lex.tokens);
    const table = new SymbolTable();
    const errors = analyzeSemantics(p.ast, table);
    const passed = errors.length === 1 && errors[0].message.includes('greater than zero');
    addResult(
      'Should flag repeat count <= 0 semantically',
      'Semantic',
      passed,
      `Expected loop count error. Got: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Loop count verification exception', 'Semantic', false, e.message);
  }

  try {
    const semanticSource = `parking ZoneE begin
      emergency visitor override gate
    end`;
    const lex = tokenize(semanticSource);
    const p = parse(lex.tokens);
    const table = new SymbolTable();
    const errors = analyzeSemantics(p.ast, table);
    const passed = errors.length === 1 && errors[0].message.includes('Only ambulance, police, and firetruck are allowed');
    addResult(
      'Should restrict emergency overrides to police/ambulance/firetruck',
      'Semantic',
      passed,
      `Expected emergency vehicle error. Got: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Emergency type restriction exception', 'Semantic', false, e.message);
  }

  return results;
}
