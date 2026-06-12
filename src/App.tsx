import { useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { tokenize } from './compiler/lexer';
import { parse } from './compiler/parser';
import { analyzeSemantics } from './compiler/semanticAnalyzer';
import { SymbolTable } from './compiler/symbolTable';
import { generateIntermediateCode } from './compiler/intermediateCode';
import { generateSimulationSteps, type SimulationStep, type SimulationInputs } from './compiler/simulator';
import type { CompilerError } from './compiler/errors';
import type { Token } from './compiler/lexer';
import type { ProgramNode } from './compiler/ast';

// Upgraded Components
import { SourceEditor } from './components/SourceEditor';
import { ParkingSimulation } from './components/ParkingSimulation';
import { TokenTable } from './components/TokenTable';
import { ParseTreeView } from './components/ParseTreeView';
import { SymbolTableView } from './components/SymbolTableView';
import { IntermediateCodeView } from './components/IntermediateCodeView';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { SimulationLog } from './components/SimulationLog';
import { CompilerStatusBar, type CompileProgressState } from './components/CompilerStatusBar';
import { LiveParameters } from './components/LiveParameters';
import { SimulationTimeline } from './components/SimulationTimeline';
import { TestSuiteView } from './components/TestSuiteView';
import { CompilerPhaseDetails } from './components/CompilerPhaseDetails';

// Presets
import { VALID_EXAMPLES } from './examples/validPrograms';

// Helper to recursively count AST nodes
function countASTNodes(node: any): number {
  if (!node) return 0;
  let count = 1; // Count this node itself
  if (node.type === 'Program') {
    if (node.stmts) {
      for (const stmt of node.stmts) {
        count += countASTNodes(stmt);
      }
    }
  } else if (node.type === 'IfStatement') {
    count += countASTNodes(node.condition);
    count += countASTNodes(node.thenStmt);
  } else if (node.type === 'RepeatStatement') {
    count += countASTNodes(node.stmt);
  }
  return count;
}

function App() {
  // 1. Source Code state
  const [code, setCode] = useState<string>(VALID_EXAMPLES[0].code);

  // 2. Compilation State Machine
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<ProgramNode | null>(null);
  const [ir, setIr] = useState<string[]>([]);
  const [errors, setErrors] = useState<CompilerError[]>([]);
  const [isCompiled, setIsCompiled] = useState<boolean>(false);

  // Compile Progress state
  const [compileState, setCompileState] = useState<CompileProgressState>('idle');
  const [failedPhase, setFailedPhase] = useState<'lexer' | 'parser' | 'semantic' | null>(null);

  // Symbol Table State
  const symbolTable = useMemo(() => new SymbolTable(), []);
  const [symbolTableMirror, setSymbolTableMirror] = useState<SymbolTable>(symbolTable);

  // 3. Simulation parameters state
  const [inputs, setInputs] = useState<SimulationInputs>({
    slotsCount: VALID_EXAMPLES[0].defaultSlots,
    approachingVehicle: VALID_EXAMPLES[0].defaultVehicle,
  });
  const [autoCloseGate, setAutoCloseGate] = useState<boolean>(true);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);

  // Simulation execution state
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 4. GUI tab selector state
  const [activeTab, setActiveTab] = useState<'tokens' | 'ast' | 'symbol' | 'ir' | 'errors' | 'log' | 'tests'>('ir');

  // Trigger compiler reset when user edits the source code
  const handleCodeChange = (newVal: string) => {
    setCode(newVal);
    // Reset compilation state
    setIsCompiled(false);
    setCompileState('idle');
    setFailedPhase(null);
    setErrors([]);
    setTokens([]);
    setAst(null);
    setIr([]);
    setSimulationSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Delayed Compiler pipeline runner (for presentation visual effect)
  const handleCompile = () => {
    // Reset play state
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSimulationSteps([]);
    setErrors([]);
    setFailedPhase(null);
    setIsCompiled(false);
    setTokens([]);
    setAst(null);
    setIr([]);

    // Step 1: Lexer Phase
    setCompileState('lexical');

    setTimeout(() => {
      const lexResult = tokenize(code);
      setTokens(lexResult.tokens);

      if (lexResult.errors.length > 0) {
        setErrors(lexResult.errors);
        setFailedPhase('lexer');
        setCompileState('failed');
        setAst(null);
        setIr([]);
        setSimulationSteps([]);
        setActiveTab('errors');
        return;
      }

      // Step 2: Parser Phase
      setCompileState('syntax');

      setTimeout(() => {
        const parseResult = parse(lexResult.tokens);
        setAst(parseResult.ast);

        if (parseResult.errors.length > 0) {
          setErrors(parseResult.errors);
          setFailedPhase('parser');
          setCompileState('failed');
          setAst(null);
          setIr([]);
          setSimulationSteps([]);
          setActiveTab('errors');
          return;
        }

        // Step 3: Semantic Analysis Phase
        setCompileState('semantic');

        setTimeout(() => {
          const semanticErrors = analyzeSemantics(parseResult.ast, symbolTable);
          
          // Copy symbol table records to local state mirror
          const copy = new SymbolTable();
          Object.assign(copy, symbolTable);
          copy.rows = [...symbolTable.rows];
          copy.reservedSlots = new Set(symbolTable.reservedSlots);
          copy.vehicleTypesChecked = new Set(symbolTable.vehicleTypesChecked);
          copy.emergencyOverrides = [...symbolTable.emergencyOverrides];
          setSymbolTableMirror(copy);

          if (semanticErrors.length > 0) {
            setErrors(semanticErrors);
            setFailedPhase('semantic');
            setCompileState('failed');
            setAst(null);
            setIr([]);
            setSimulationSteps([]);
            setActiveTab('errors');
            return;
          }

          // Step 4: Intermediate Code Generation
          setCompileState('ir');

          setTimeout(() => {
            const irLines = generateIntermediateCode(parseResult.ast);
            setIr(irLines);

            // Setup Simulation
            const steps = generateSimulationSteps(parseResult.ast, inputs);
            setSimulationSteps(steps);

            setCompileState('success');
            setIsCompiled(true);
            setActiveTab('ir');
          }, 250);

        }, 250);

      }, 250);

    }, 250);
  };

  // Re-generate steps if sliders/dropdown parameters change
  useEffect(() => {
    if (isCompiled && ast) {
      const steps = generateSimulationSteps(ast, inputs);
      setSimulationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [inputs, isCompiled, ast]);

  // If sirens override mode is turned on, force gate open in simulation input variables
  useEffect(() => {
    if (emergencyMode) {
      setInputs((prev) => ({
        ...prev,
        approachingVehicle: 'ambulance', // force emergency vehicle
      }));
    }
  }, [emergencyMode]);

  // Simulation play loop timer
  useEffect(() => {
    let intervalId: any = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentStepIndex((prevIdx) => {
          if (prevIdx < simulationSteps.length - 1) {
            return prevIdx + 1;
          } else {
            setIsPlaying(false);
            return prevIdx;
          }
        });
      }, 1500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, simulationSteps]);

  // Controls Handlers
  const handleRunSimulation = () => {
    if (!isCompiled) return;
    setActiveTab('log');
    if (currentStepIndex >= simulationSteps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePauseSimulation = () => {
    setIsPlaying(false);
  };

  const handleStepSimulation = () => {
    if (!isCompiled) return;
    setActiveTab('log');
    setIsPlaying(false);
    if (currentStepIndex < simulationSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Calculate current executing line number for editor highlighting
  const currentStep = simulationSteps[currentStepIndex] || null;
  const executingLine = currentStep ? currentStep.sourceLine : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20">
      {/* Title Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
                ParkCommand Compiler Simulator
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Smart Parking Control Language with Compiler Phases and Animated Execution
            </p>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full flex flex-col gap-4">
        {/* Compiler Status bar progress tracker & Metrics Panel in Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CompilerStatusBar
            compileState={compileState}
            failedPhase={failedPhase}
            errorMessageCount={errors.length}
          />
          <CompilerPhaseDetails
            tokenCount={tokens.length}
            astNodeCount={countASTNodes(ast)}
            symbolTableCount={symbolTableMirror.rows.length}
            irLineCount={ir.length}
            simulationStepCount={simulationSteps.length}
          />
        </div>

        {/* Live parameter controllers */}
        <LiveParameters
          inputs={inputs}
          onInputsChange={setInputs}
          autoCloseGate={autoCloseGate}
          onAutoCloseToggle={setAutoCloseGate}
          emergencyMode={emergencyMode}
          onEmergencyModeToggle={setEmergencyMode}
        />

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
          {/* Left Column: Code Editor */}
          <div className="lg:col-span-2 flex flex-col h-[520px] lg:h-auto">
            <SourceEditor
              code={code}
              onChange={handleCodeChange}
              errors={errors}
              onCompile={handleCompile}
              onRunSimulation={handleRunSimulation}
              onPauseSimulation={handlePauseSimulation}
              onStepSimulation={handleStepSimulation}
              onResetSimulation={handleResetSimulation}
              isCompiled={isCompiled}
              simulationStep={currentStepIndex}
              totalSteps={simulationSteps.length}
              isSimulating={isPlaying}
              executingLine={executingLine}
            />
          </div>

          {/* Right Column: Visual Arena & Tabbed views */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Top-Down Parking Animation Scene */}
            <div className="h-[380px]">
              <ParkingSimulation
                currentStep={currentStep}
                slotsCount={inputs.slotsCount}
                approachingVehicle={inputs.approachingVehicle}
                emergencyMode={emergencyMode}
              />
            </div>

            {/* Horizontal Step Timeline */}
            <SimulationTimeline
              steps={simulationSteps}
              currentStepIndex={currentStepIndex}
            />

            {/* Compiled tabs view panel */}
            <div className="flex-1 flex flex-col bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl min-h-[300px]">
              {/* Tab Selector */}
              <div className="flex flex-wrap border-b border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setActiveTab('ir')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === 'ir'
                      ? 'bg-slate-800 text-purple-400 border-b border-purple-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  IR Code
                </button>
                <button
                  onClick={() => setActiveTab('log')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === 'log'
                      ? 'bg-slate-800 text-cyan-400 border-b border-cyan-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  Simulation Log
                </button>
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === 'tokens'
                      ? 'bg-slate-800 text-blue-400 border-b border-blue-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  Tokens
                </button>
                <button
                  onClick={() => setActiveTab('ast')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === 'ast'
                      ? 'bg-slate-800 text-yellow-400 border-b border-yellow-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  Parse Tree
                </button>
                <button
                  onClick={() => setActiveTab('symbol')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === 'symbol'
                      ? 'bg-slate-800 text-indigo-400 border-b border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  Symbol Table
                </button>
                 <button
                  onClick={() => setActiveTab('errors')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative ${
                    activeTab === 'errors'
                      ? 'bg-slate-800 text-rose-500 border-b border-rose-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  Diagnostics
                  {errors.length > 0 && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.25 bg-rose-600 text-[9px] font-bold text-white rounded-full animate-bounce">
                      {errors.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === 'tests'
                      ? 'bg-slate-800 text-emerald-400 border-b border-emerald-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  Unit Tests
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-3 bg-slate-900/60 flex-1 overflow-auto max-h-[300px]">
                {activeTab === 'tokens' && <TokenTable tokens={tokens} />}
                {activeTab === 'ast' && <ParseTreeView ast={ast} />}
                {activeTab === 'symbol' && <SymbolTableView symbolTable={symbolTableMirror} />}
                {activeTab === 'ir' && <IntermediateCodeView ir={ir} />}
                {activeTab === 'errors' && <DiagnosticsPanel errors={errors} isCompiled={isCompiled} />}
                {activeTab === 'log' && (
                  <SimulationLog steps={simulationSteps} currentStepIndex={currentStepIndex} />
                )}
                {activeTab === 'tests' && <TestSuiteView />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
