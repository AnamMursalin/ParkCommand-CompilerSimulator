import { tokenize } from './lexer';
import { parse } from './parser';
import { analyzeSemantics } from './semanticAnalyzer';
import { SymbolTable } from './symbolTable';
import { compileToIRInstructions } from './intermediateCode';
import { optimizeIR, getOptimizationStats } from './optimizer';

export interface TestResult {
  name: string;
  phase: 'Lexer' | 'Parser' | 'Semantic' | 'Optimizer';
  status: 'Passed' | 'Failed';
  message?: string;
}

export function runCompilerTests(): TestResult[] {
  const results: TestResult[] = [];

  const addResult = (name: string, phase: 'Lexer' | 'Parser' | 'Semantic' | 'Optimizer', passed: boolean, message?: string) => {
    results.push({
      name,
      phase,
      status: passed ? 'Passed' : 'Failed',
      message: passed ? undefined : message,
    });
  };

  // 1. Spaceless Command Keyword checksensor
  try {
    const source = 'parking MallZone begin checksensor end';
    const { errors } = tokenize(source);
    const passed = errors.length > 0 && errors.some(e => e.badToken === 'checksensor' && e.suggestion?.includes("check"));
    addResult(
      'Should report lexical error with spelling suggestion for merged "checksensor"',
      'Lexer',
      passed,
      `Expected lexical error suggestion for 'checksensor'. Got errors: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Spaceless checksensor check', 'Lexer', false, e.message);
  }

  // 2. Spaceless if condition ifvehicle
  try {
    const source = 'parking Airport begin ifvehicle==VIPthenopengate end';
    const { errors } = tokenize(source);
    const passed = errors.length > 0 && errors.some(e => e.badToken === 'ifvehicle' && e.suggestion?.includes("if"));
    addResult(
      'Should report lexical error with spacing suggestion for merged condition "ifvehicle"',
      'Lexer',
      passed,
      `Expected lexical error suggestion for 'ifvehicle'. Got errors: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Spaceless ifvehicle check', 'Lexer', false, e.message);
  }

  // 3. Unrecognized character check
  try {
    const source = 'parking MallZone $';
    const { errors } = tokenize(source);
    const passed = errors.length > 0 && errors.some(e => e.message.includes("Unrecognized character '$'"));
    addResult(
      'Should report lexical error on illegal character "$"',
      'Lexer',
      passed,
      `Expected lexical error for '$'. Got errors: ${errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Illegal character check', 'Lexer', false, e.message);
  }

  // 4. Valid spaced program compilation
  try {
    const source = 'parking MallZone begin if slots > 20 then open gate reserve slot VIP_A1 check sensor release slot VIP_A1 end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const table = new SymbolTable();
    const semanticErrors = analyzeSemantics(parseResult.ast, table);
    const passed = lexResult.errors.length === 0 && parseResult.errors.length === 0 && semanticErrors.length === 0 && parseResult.ast !== null;
    addResult(
      'Should compile valid program with correct spacing successfully',
      'Parser',
      passed,
      `Expected successful compilation. Lex errors: ${lexResult.errors.length}, Parse errors: ${parseResult.errors.length}, Semantic errors: ${semanticErrors.length}`
    );
  } catch (e: any) {
    addResult('Valid program check', 'Parser', false, e.message);
  }

  // 5. Missing begin clause syntax failure
  try {
    const source = 'parking ZoneA open gate end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const passed = parseResult.errors.length > 0 && parseResult.errors.some(e => e.message.includes("begin"));
    addResult(
      'Should report syntax error when "begin" is missing after zone identifier',
      'Parser',
      passed,
      `Expected syntax error about missing 'begin'. Got: ${parseResult.errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Missing begin check', 'Parser', false, e.message);
  }

  // 6. Missing end clause syntax failure
  try {
    const source = 'parking ZoneA begin open gate';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const passed = parseResult.errors.length > 0 && parseResult.errors.some(e => e.message.includes("end"));
    addResult(
      'Should report syntax error when block termination "end" is missing',
      'Parser',
      passed,
      `Expected syntax error about missing 'end'. Got: ${parseResult.errors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Missing end check', 'Parser', false, e.message);
  }

  // 7. Negative repeat count semantic failure
  try {
    const source = 'parking LoopZone begin repeat -2 times check sensor end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const table = new SymbolTable();
    const semanticErrors = analyzeSemantics(parseResult.ast, table);
    const passed = parseResult.errors.length === 0 && semanticErrors.length > 0 && semanticErrors.some(e => e.message.includes("Found: -2"));
    addResult(
      'Should parse negative repeat count but reject it semantically (count <= 0)',
      'Semantic',
      passed,
      `Expected semantic error for repeat -2. Parse errors: ${parseResult.errors.length}. Semantic errors: ${semanticErrors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Negative repeat check', 'Semantic', false, e.message);
  }

  // 8. Duplicate Slot Reservations semantic failure
  try {
    const source = 'parking MallZone begin reserve slot VIP_A1 reserve slot VIP_A1 end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const table = new SymbolTable();
    const semanticErrors = analyzeSemantics(parseResult.ast, table);
    const passed = semanticErrors.length > 0 && semanticErrors.some(e => e.message.includes("already reserved"));
    addResult(
      'Should reject duplicate slot reservations semantically',
      'Semantic',
      passed,
      `Expected semantic error about duplicate reservation. Semantic errors: ${semanticErrors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Duplicate slot reservation check', 'Semantic', false, e.message);
  }

  // 9. Releasing Unreserved Slot semantic failure
  try {
    const source = 'parking MallZone begin release slot VIP_A1 end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const table = new SymbolTable();
    const semanticErrors = analyzeSemantics(parseResult.ast, table);
    const passed = semanticErrors.length > 0 && semanticErrors.some(e => e.message.includes("cannot be released because it is not reserved"));
    addResult(
      'Should reject releasing a slot that was never reserved',
      'Semantic',
      passed,
      `Expected semantic error about releasing unreserved slot. Semantic errors: ${semanticErrors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Unreserved release check', 'Semantic', false, e.message);
  }

  // 10. Invalid emergency override category
  try {
    const source = 'parking Hospital begin emergency visitor override gate end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const table = new SymbolTable();
    const semanticErrors = analyzeSemantics(parseResult.ast, table);
    const passed = semanticErrors.length > 0 && semanticErrors.some(e => e.message.includes("Invalid emergency vehicle type"));
    addResult(
      'Should restrict emergency override categories to ambulance, police, and firetruck',
      'Semantic',
      passed,
      `Expected semantic error about invalid emergency category. Semantic errors: ${semanticErrors.map(e => e.message).join(', ')}`
    );
  } catch (e: any) {
    addResult('Invalid emergency category check', 'Semantic', false, e.message);
  }

  // 11. Optimization: Remove unused labels
  try {
    const source = 'parking TestZone begin open gate close gate end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const irOriginal = compileToIRInstructions(parseResult.ast);
    const irOptimized = optimizeIR(irOriginal);
    // Original shouldn't have any unused labels, so count should be same
    const stats = getOptimizationStats(irOriginal, irOptimized);
    const passed = stats.originalCount === stats.optimizedCount;
    addResult(
      'Optimizer should not change valid IR without optimizable code',
      'Optimizer',
      passed,
      `Optimization stats: removed ${stats.removed} instructions (${stats.reductionPercentage}%)`
    );
  } catch (e: any) {
    addResult('No-op optimization test', 'Optimizer', false, e.message);
  }

  // 12. Optimization: Get valid optimization stats
  try {
    const source = 'parking LoopZone begin repeat 0 times check sensor end';
    const lexResult = tokenize(source);
    const parseResult = parse(lexResult.tokens);
    const table = new SymbolTable();
    analyzeSemantics(parseResult.ast, table); // Should fail, but we still test optimizer
    const irOriginal = compileToIRInstructions(parseResult.ast);
    const irOptimized = optimizeIR(irOriginal);
    const stats = getOptimizationStats(irOriginal, irOptimized);
    const passed = 
      typeof stats.originalCount === 'number' &&
      typeof stats.optimizedCount === 'number' &&
      typeof stats.removed === 'number' &&
      typeof stats.reductionPercentage === 'number';
    addResult(
      'Optimizer should return valid optimization statistics',
      'Optimizer',
      passed,
      `Stats: original=${stats.originalCount}, optimized=${stats.optimizedCount}, removed=${stats.removed}, reduction=${stats.reductionPercentage}%`
    );
  } catch (e: any) {
    addResult('Optimization stats test', 'Optimizer', false, e.message);
  }

  return results;
}
