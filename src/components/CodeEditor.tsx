import React, { useState, useEffect, useRef } from 'react';
import { Play, SkipForward, RotateCcw, AlertTriangle, Code, Terminal, CheckCircle } from 'lucide-react';
import { CompilerError } from '../compiler/errors';
import { VALID_EXAMPLES } from '../examples/validPrograms';
import { INVALID_EXAMPLES } from '../examples/invalidPrograms';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  errors: CompilerError[];
  onCompile: () => void;
  onRunSimulation: () => void;
  onStepSimulation: () => void;
  onReset: () => void;
  isCompiled: boolean;
  simulationStep: number;
  totalSteps: number;
  isSimulating: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  errors,
  onCompile,
  onRunSimulation,
  onStepSimulation,
  onReset,
  isCompiled,
  simulationStep,
  totalSteps,
  isSimulating,
}) => {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = code.split('\n');

  // Track cursor position
  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBeforeCursor = target.value.substring(0, target.selectionStart);
    const linesBefore = textBeforeCursor.split('\n');
    setCursorPos({
      line: linesBefore.length,
      col: linesBefore[linesBefore.length - 1].length + 1,
    });
  };

  const loadExample = (exampleCode: string, name: string) => {
    onChange(exampleCode);
    onReset();
  };

  // Find if a line has an error
  const getLineError = (lineNum: number): CompilerError | undefined => {
    return errors.find((e) => e.line === lineNum);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-950 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-slate-200 tracking-wide text-sm">Program Source Editor</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Example Loaders */}
          <div className="flex gap-2">
            <select
              className="text-xs bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const example = VALID_EXAMPLES.find((ex) => ex.name === val);
                if (example) loadExample(example.code, example.name);
                e.target.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>Load Valid Examples...</option>
              {VALID_EXAMPLES.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </select>

            <select
              className="text-xs bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const example = INVALID_EXAMPLES.find((ex) => ex.name === val);
                if (example) loadExample(example.code, example.name);
                e.target.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>Load Error Examples...</option>
              {INVALID_EXAMPLES.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden font-mono text-sm relative">
        {/* Line Numbers Gutter */}
        <div className="flex flex-col select-none text-right text-slate-500 bg-slate-950/80 border-r border-slate-800 p-3 pt-4 w-12 gap-[1.5px] overflow-hidden">
          {lines.map((_, i) => {
            const err = getLineError(i + 1);
            return (
              <div
                key={i}
                className={`h-5 leading-5 text-xs pr-1 flex items-center justify-end ${
                  err ? 'text-red-500 bg-red-950/25 font-bold rounded px-1' : ''
                }`}
                title={err?.message}
              >
                {err ? <AlertTriangle className="w-3 h-3 text-red-500 mr-1 inline" /> : null}
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          onScroll={(e) => {
            // Keep gutter scrolled if scrolling editor
          }}
          className="flex-1 resize-none bg-transparent text-slate-100 p-3 pt-4 focus:outline-none overflow-y-auto leading-5 whitespace-pre placeholder-slate-700 selection:bg-cyan-500/30"
          placeholder="# Write your ParkCommand program here...&#10;parking MallZone begin&#10;  open gate&#10;end"
          spellCheck={false}
          style={{
            lineHeight: '21.5px', // Match the gutter spacing
          }}
        />
      </div>

      {/* Editor Footer / Info Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 font-mono">
        <div>
          Line {cursorPos.line}, Col {cursorPos.col}
        </div>
        <div className="flex items-center gap-2">
          {errors.length > 0 ? (
            <span className="flex items-center gap-1 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.length} error{errors.length > 1 ? 's' : ''} detected
            </span>
          ) : isCompiled ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Compilation successful
            </span>
          ) : (
            <span className="text-slate-500">Not Compiled</span>
          )}
        </div>
      </div>

      {/* Compiler Actions Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-700/60 bg-slate-950 p-2 gap-2">
        <button
          onClick={onCompile}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md focus:ring-2 focus:ring-cyan-500/50"
        >
          <Code className="w-4 h-4" />
          Compile
        </button>

        <button
          onClick={onRunSimulation}
          disabled={!isCompiled || isSimulating}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-white rounded-lg text-sm font-semibold transition-all shadow-md ${
            isCompiled && !isSimulating
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          <Play className="w-4 h-4" />
          Run Simulation
        </button>

        <button
          onClick={onStepSimulation}
          disabled={!isCompiled || isSimulating || (simulationStep >= totalSteps - 1 && totalSteps > 0)}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-white rounded-lg text-sm font-semibold transition-all shadow-md ${
            isCompiled && !isSimulating && !(simulationStep >= totalSteps - 1 && totalSteps > 0)
              ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 focus:ring-2 focus:ring-amber-500/50'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          <SkipForward className="w-4 h-4" />
          Step {totalSteps > 0 ? `(${simulationStep}/${totalSteps - 1})` : ''}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};
