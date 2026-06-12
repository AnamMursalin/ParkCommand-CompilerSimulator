import React, { useState, useEffect, useRef } from 'react';
import { Play, SkipForward, RotateCcw, AlertTriangle, Code, Terminal, CheckCircle2, Pause } from 'lucide-react';
import type { CompilerError } from '../compiler/errors';
import { VALID_EXAMPLES } from '../examples/validPrograms';
import { INVALID_EXAMPLES } from '../examples/invalidPrograms';

interface SourceEditorProps {
  code: string;
  onChange: (value: string) => void;
  errors: CompilerError[];
  onCompile: () => void;
  onRunSimulation: () => void;
  onPauseSimulation: () => void;
  onStepSimulation: () => void;
  onResetSimulation: () => void;
  isCompiled: boolean;
  simulationStep: number;
  totalSteps: number;
  isSimulating: boolean;
  executingLine: number | null; // The line currently executing
}

export const SourceEditor: React.FC<SourceEditorProps> = ({
  code,
  onChange,
  errors,
  onCompile,
  onRunSimulation,
  onPauseSimulation,
  onStepSimulation,
  onResetSimulation,
  isCompiled,
  simulationStep,
  totalSteps,
  isSimulating,
  executingLine,
}) => {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lines = code.split('\n');

  // Sync scroll between textarea and highlights overlay
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Keyboard shortcut Ctrl + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      onCompile();
    }
  };

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

  const getLineError = (lineNum: number): CompilerError | undefined => {
    return errors.find((e) => e.line === lineNum);
  };

  // Syntax highlighting markup parser
  const renderHighlightedCode = () => {
    const keywordSet = new Set(['parking', 'begin', 'end', 'if', 'then', 'repeat', 'times', 'emergency', 'override', 'slots', 'vehicle']);
    const commandSet = new Set(['open', 'close', 'reserve', 'release', 'check']);
    const objectSet = new Set(['gate', 'slot', 'sensor']);
    const typeSet = new Set(['VIP', 'staff', 'visitor', 'ambulance', 'police', 'firetruck']);

    const tokenRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b|(&gt;=|&lt;=|&gt;|&lt;|==|!=)|\b\d+\b/g;

    return lines.map((lineText, idx) => {
      const lineNum = idx + 1;
      const isExecuting = executingLine === lineNum;
      const hasError = getLineError(lineNum) !== undefined;

      // Handle comments first
      if (lineText.trim().startsWith('#')) {
        return (
          <div
            key={idx}
            className={`h-5.5 leading-5.5 px-3 select-none flex whitespace-pre ${
              isExecuting ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
            }`}
          >
            <span className="text-slate-500 italic">{lineText}</span>
          </div>
        );
      }

      // Apply highlights in a single pass to avoid matching inside generated HTML tags
      const escapedLine = lineText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const html = escapedLine.replace(tokenRegex, (match) => {
        if (keywordSet.has(match)) {
          return `<span class="text-cyan-400 font-bold">${match}</span>`;
        }
        if (commandSet.has(match)) {
          return `<span class="text-purple-400 font-bold">${match}</span>`;
        }
        if (objectSet.has(match)) {
          return `<span class="text-amber-400 font-medium">${match}</span>`;
        }
        if (typeSet.has(match)) {
          return `<span class="text-indigo-400 font-medium">${match}</span>`;
        }
        if (/^(==|!=|&gt;=|&lt;=|&gt;|&lt;)$/.test(match)) {
          return `<span class="text-rose-400 font-bold">${match}</span>`;
        }
        if (/^\d+$/.test(match)) {
          return `<span class="text-yellow-400 font-bold">${match}</span>`;
        }
        return match;
      });

      return (
        <div
          key={idx}
          className={`h-5.5 leading-5.5 px-3 whitespace-pre flex border-l-2 transition-all duration-300 ${
            isExecuting 
              ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200' 
              : hasError 
              ? 'bg-red-950/20 border-red-500/50'
              : 'border-transparent'
          }`}
          dangerouslySetInnerHTML={{ __html: html || ' ' }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-950 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-slate-200 tracking-wide text-sm">ParkCommand IDE</span>
        </div>
        
        <div className="flex gap-2">
          <select
            className="text-xs bg-slate-900 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const example = VALID_EXAMPLES.find((ex) => ex.name === val);
              if (example) {
                onChange(example.code);
                onResetSimulation();
              }
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>Load Valid Presets...</option>
            {VALID_EXAMPLES.map((ex) => (
              <option key={ex.name} value={ex.name}>{ex.name}</option>
            ))}
          </select>

          <select
            className="text-xs bg-slate-900 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const example = INVALID_EXAMPLES.find((ex) => ex.name === val);
              if (example) {
                onChange(example.code);
                onResetSimulation();
              }
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>Load Diagnostics Presets...</option>
            {INVALID_EXAMPLES.map((ex) => (
              <option key={ex.name} value={ex.name}>{ex.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden font-mono text-sm relative bg-slate-950">
        {/* Line Numbers Gutter */}
        <div className="flex flex-col select-none text-right text-slate-600 bg-slate-950 border-r border-slate-900 p-2 pt-4 w-12 gap-[1px] overflow-hidden">
          {lines.map((_, i) => {
            const err = getLineError(i + 1);
            const isExecuting = executingLine === (i + 1);
            return (
              <div
                key={i}
                className={`h-5.5 leading-5.5 text-xs pr-1.5 flex items-center justify-end font-bold select-none ${
                  isExecuting 
                    ? 'text-cyan-400 bg-cyan-950/40 rounded px-1' 
                    : err 
                    ? 'text-red-500 bg-red-950/20 rounded px-1' 
                    : ''
                }`}
                title={err?.message}
              >
                {err ? <AlertTriangle className="w-3 h-3 text-red-500 mr-1 animate-pulse" /> : null}
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Dual-Layer Highlight & Input Arena */}
        <div className="flex-1 relative h-full overflow-hidden">
          {/* Layer 1: Syntax Highlights Overlay (non-interactive, scrolling synced) */}
          <div
            ref={highlightRef}
            className="absolute inset-0 p-2 pt-4 overflow-hidden pointer-events-none select-none"
            style={{
              lineHeight: '22px', // Line height matched precisely
            }}
          >
            {renderHighlightedCode()}
          </div>

          {/* Layer 2: Real Textarea (transparent text, overlays L1) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 p-2 pt-4 w-full h-full bg-transparent text-transparent caret-cyan-400 resize-none focus:outline-none overflow-auto font-mono text-sm selection:bg-cyan-500/20"
            placeholder="# Enter your ParkCommand compiler script..."
            spellCheck={false}
            style={{
              lineHeight: '22px',
              fontFamily: 'ui-monospace, monospace',
            }}
          />
        </div>
      </div>

      {/* Editor Footer Status Gutter */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-950 border-t border-slate-900 text-xs text-slate-500 font-mono">
        <div>
          Line {cursorPos.line}, Col {cursorPos.col} | <span className="text-[10px] text-slate-500 font-sans">(Press Ctrl+Enter to Compile)</span>
        </div>
        <div className="flex items-center gap-2">
          {errors.length > 0 ? (
            <span className="flex items-center gap-1 text-red-400 font-sans font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.length} error{errors.length > 1 ? 's' : ''} detected
            </span>
          ) : isCompiled ? (
            <span className="flex items-center gap-1 text-emerald-400 font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
              Build Ready
            </span>
          ) : (
            <span className="text-slate-500 font-sans">Not Compiled</span>
          )}
        </div>
      </div>

      {/* Compiler Actions Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 border-t border-slate-800 bg-slate-950 p-2 gap-2">
        <button
          onClick={onCompile}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md focus:ring-2 focus:ring-cyan-500/50"
        >
          <Code className="w-4 h-4" />
          Compile
        </button>

        <button
          onClick={onRunSimulation}
          disabled={!isCompiled}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-white rounded-lg text-sm font-semibold transition-all shadow-md ${
            isCompiled
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 focus:ring-2 focus:ring-emerald-500/50'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/30'
          }`}
        >
          <Play className="w-4 h-4" />
          Run
        </button>

        <button
          onClick={onPauseSimulation}
          disabled={!isCompiled || !isSimulating}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-white rounded-lg text-sm font-semibold transition-all shadow-md ${
            isCompiled && isSimulating
              ? 'bg-orange-600 hover:bg-orange-500 active:bg-orange-700 focus:ring-2 focus:ring-orange-500/50'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/30'
          }`}
        >
          <Pause className="w-4 h-4" />
          Pause
        </button>

        <button
          onClick={onStepSimulation}
          disabled={!isCompiled || isSimulating || (simulationStep >= totalSteps - 1 && totalSteps > 0)}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-white rounded-lg text-sm font-semibold transition-all shadow-md ${
            isCompiled && !isSimulating && !(simulationStep >= totalSteps - 1 && totalSteps > 0)
              ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 focus:ring-2 focus:ring-amber-500/50'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/30'
          }`}
        >
          <SkipForward className="w-4 h-4" />
          Step {totalSteps > 0 ? `(${simulationStep})` : ''}
        </button>

        <button
          onClick={onResetSimulation}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-350 rounded-lg text-sm font-semibold transition-all col-span-2 md:col-span-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};
