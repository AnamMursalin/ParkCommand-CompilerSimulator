import { useState, useEffect, useMemo } from 'react';
import { Terminal, Shield, Eye, BookmarkCheck, SlidersHorizontal, Cpu, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { tokenize } from './compiler/lexer';
import { parse } from './compiler/parser';
import { analyzeSemantics } from './compiler/semanticAnalyzer';
import { SymbolTable } from './compiler/symbolTable';
import { generateIntermediateCode } from './compiler/intermediateCode';
import { generateSimulationSteps, SimulationStep, SimulationInputs } from './compiler/simulator';
import { CompilerError } from './compiler/errors';
import { Token } from './compiler/lexer';
import { ProgramNode } from './compiler/ast';

// Components
import { CodeEditor } from './components/CodeEditor';
import { ParkingAnimation } from './components/ParkingAnimation';
import { TokenTable } from './components/TokenTable';
import { ParseTree } from './components/ParseTree';
import { SymbolTableView } from './components/SymbolTableView';
import { IntermediateCodeView } from './components/IntermediateCodeView';
import { ErrorPanel } from './components/ErrorPanel';
import { SimulationLog } from './components/SimulationLog';
import { TestSuiteView } from './components/TestSuiteView';

// Sample presets
import { VALID_EXAMPLES } from './examples/validPrograms';

function App() {
  // 1. Core Code Editor State
  const [code, setCode] = useState<string>(VALID_EXAMPLES[0].code);

  // 2. Compilation Artifact State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<ProgramNode | null>(null);
  const [ir, setIr] = useState<string[]>([]);
  const [errors, setErrors] = useState<CompilerError[]>([]);
  const [isCompiled, setIsCompiled] = useState<boolean>(false);

  // Track phase success individually
  const [lexicalPassed, setLexicalPassed] = useState<'passed' | 'failed' | 'idle'>('idle');
  const [syntaxPassed, setSyntaxPassed] = useState<'passed' | 'failed' | 'idle'>('idle');
  const [semanticPassed, setSemanticPassed] = useState<'passed' | 'failed' | 'idle'>('idle');

  // Create Symbol Table instance once
  const symbolTable = useMemo(() => new SymbolTable(), []);
  // We mirror the symbol table in state for reactive rendering in React
  const [symbolTableMirror, setSymbolTableMirror] = useState<SymbolTable>(symbolTable);

  // 3. Interactive Simulation State
  const [inputs, setInputs] = useState<SimulationInputs>({
    slotsCount: VALID_EXAMPLES[0].defaultSlots,
    approachingVehicle: VALID_EXAMPLES[0].defaultVehicle,
  });
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 4. GUI Navigation State
  const [activeTab, setActiveTab] = useState<'tokens' | 'ast' | 'symbol' | 'ir' | 'errors' | 'log' | 'tests'>('ir');

  // Compile Pipeline
  const handleCompile = () => {
    // Stop any running simulation
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSimulationSteps([]);

    // Reset phases
    setLexicalPassed('idle');
    setSyntaxPassed('idle');
    setSemanticPassed('idle');
    setIsCompiled(false);

    // Phase 1: Lexical Analysis
    const lexResult = tokenize(code);
    setTokens(lexResult.tokens);

    if (lexResult.errors.length > 0) {
      setErrors(lexResult.errors);
      setLexicalPassed('failed');
      setAst(null);
      setIr([]);
      setActiveTab('errors');
      return;
    }
    setLexicalPassed('passed');

    // Phase 2: Syntax Analysis
    const parseResult = parse(lexResult.tokens);
    setAst(parseResult.ast);

    if (parseResult.errors.length > 0) {
      setErrors(parseResult.errors);
      setSyntaxPassed('failed');
      setIr([]);
      setActiveTab('errors');
      return;
    }
    setSyntaxPassed('passed');

    // Phase 3: Semantic Analysis
    const semanticErrors = analyzeSemantics(parseResult.ast, symbolTable);
    // Refresh mirror for display
    const copy = new SymbolTable();
    Object.assign(copy, symbolTable);
    copy.rows = [...symbolTable.rows];
    copy.reservedSlots = new Set(symbolTable.reservedSlots);
    copy.vehicleTypesChecked = new Set(symbolTable.vehicleTypesChecked);
    copy.emergencyOverrides = [...symbolTable.emergencyOverrides];
    setSymbolTableMirror(copy);

    if (semanticErrors.length > 0) {
      setErrors(semanticErrors);
      setSemanticPassed('failed');
      setIr([]);
      setActiveTab('errors');
      return;
    }
    setSemanticPassed('passed');

    // Phase 4: Intermediate Code Generation
    const irLines = generateIntermediateCode(parseResult.ast);
    setIr(irLines);
    setErrors([]);
    setIsCompiled(true);

    // Prepare steps
    const steps = generateSimulationSteps(parseResult.ast, inputs);
    setSimulationSteps(steps);

    // Focus on compilation result tab
    setActiveTab('ir');
  };

  // Re-generate simulation steps if inputs change while compiled
  useEffect(() => {
    if (isCompiled && ast) {
      const steps = generateSimulationSteps(ast, inputs);
      setSimulationSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [inputs, isCompiled, ast]);

  // Simulation Automatic Playback Loop
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

  // Handlers for Simulation Action buttons
  const handleRunSimulation = () => {
    if (!isCompiled) return;
    setActiveTab('log');
    if (currentStepIndex >= simulationSteps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
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

  const currentStep = simulationSteps[currentStepIndex] || null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20">
      {/* Premium Sub-Header Title Panel */}
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

          {/* Compilation Stage Badges */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            {/* Lexer Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lexer:</span>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                lexicalPassed === 'passed' ? 'bg-emerald-500/15 text-emerald-400' :
                lexicalPassed === 'failed' ? 'bg-red-500/15 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {lexicalPassed === 'passed' ? 'Passed' : lexicalPassed === 'failed' ? 'Failed' : 'Idle'}
              </span>
            </div>

            {/* Parser Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Parser:</span>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                syntaxPassed === 'passed' ? 'bg-emerald-500/15 text-emerald-400' :
                syntaxPassed === 'failed' ? 'bg-red-500/15 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {syntaxPassed === 'passed' ? 'Passed' : syntaxPassed === 'failed' ? 'Failed' : 'Idle'}
              </span>
            </div>

            {/* Semantics Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Semantics:</span>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                semanticPassed === 'passed' ? 'bg-emerald-500/15 text-emerald-400' :
                semanticPassed === 'failed' ? 'bg-red-500/15 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {semanticPassed === 'passed' ? 'Passed' : semanticPassed === 'failed' ? 'Failed' : 'Idle'}
              </span>
            </div>

            {/* IR Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IR Code:</span>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                isCompiled ? 'bg-purple-500/15 text-purple-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isCompiled ? 'Generated' : 'Idle'}
              </span>
            </div>

            {/* Simulation Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sim:</span>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                errors.length > 0 ? 'bg-red-500/15 text-red-400' :
                isPlaying ? 'bg-blue-500/15 text-blue-400 animate-pulse' :
                currentStepIndex > 0 ? 'bg-amber-500/15 text-amber-400' :
                isCompiled ? 'bg-emerald-500/15 text-emerald-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {errors.length > 0 ? 'Blocked' : isPlaying ? 'Running' : currentStepIndex > 0 ? 'Active' : isCompiled ? 'Ready' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto p-4 flex-1 w-full grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Column: Code Editor (2/5 size on large screens) */}
        <div className="lg:col-span-2 flex flex-col">
          <CodeEditor
            code={code}
            onChange={setCode}
            errors={errors}
            onCompile={handleCompile}
            onRunSimulation={handleRunSimulation}
            onStepSimulation={handleStepSimulation}
            onReset={handleResetSimulation}
            isCompiled={isCompiled}
            simulationStep={currentStepIndex}
            totalSteps={simulationSteps.length}
            isSimulating={isPlaying}
          />
        </div>

        {/* Right Column: Visualizer & Compiler Diagnostics tabs (3/5 size) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Animated Parking Scene */}
          <div className="flex-shrink-0">
            <ParkingAnimation
              inputs={inputs}
              onInputsChange={setInputs}
              currentStep={currentStep}
            />
          </div>

          {/* Tabbed Panel */}
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl">
            {/* Tabs Selector Bar */}
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
                Parse Tree (AST)
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
                    ? 'bg-slate-800 text-rose-400 border-b border-rose-500'
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
                    ? 'bg-slate-800 text-emerald-450 border-b border-emerald-500'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                Unit Tests
              </button>
            </div>

            {/* Active Tab Contents */}
            <div className="p-3 bg-slate-900/60 flex-1 min-h-[220px]">
              {activeTab === 'tokens' && <TokenTable tokens={tokens} />}
              {activeTab === 'ast' && <ParseTree ast={ast} />}
              {activeTab === 'symbol' && <SymbolTableView symbolTable={symbolTableMirror} />}
              {activeTab === 'ir' && <IntermediateCodeView ir={ir} />}
              {activeTab === 'errors' && <ErrorPanel errors={errors} isCompiled={isCompiled} />}
              {activeTab === 'log' && (
                <SimulationLog steps={simulationSteps} currentStepIndex={currentStepIndex} />
              )}
              {activeTab === 'tests' && <TestSuiteView />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
