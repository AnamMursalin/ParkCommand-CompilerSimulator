import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Cpu, KeyRound, CornerDownRight, SquarePlay } from 'lucide-react';
import type { ProgramNode, ASTNode } from '../compiler/ast';

interface ParseTreeViewProps {
  ast: ProgramNode | null;
}

export const ParseTreeView: React.FC<ParseTreeViewProps> = ({ ast }) => {
  if (!ast) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-500 font-medium">
        <Cpu className="w-8 h-8 text-slate-600 mb-2" />
        No AST available. Write valid program and compile to view parse tree.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 p-4 font-mono text-sm overflow-y-auto max-h-[350px]">
      <div className="text-xs text-slate-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
        <SquarePlay className="w-4 h-4 text-cyan-400" />
        <span>Abstract Syntax Tree (AST)</span>
      </div>
      <div className="pl-1">
        <TreeNode node={ast} />
      </div>
    </div>
  );
};

interface TreeNodeProps {
  node: ASTNode;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Helper to determine labels and children
  const getTreeDetails = (n: ASTNode): { label: string; subText?: string; children?: { key: string; val: ASTNode }[] } => {
    switch (n.type) {
      case 'Program':
        return {
          label: 'Program',
          subText: `zoneId: "${n.zoneId}"`,
          children: n.stmts.map((stmt, idx) => ({ key: `stmt-${idx}`, val: stmt })),
        };
      case 'GateCommand':
        return {
          label: 'GateCommand',
          subText: `action: ${n.action.toUpperCase()}`,
        };
      case 'SlotCommand':
        return {
          label: 'SlotCommand',
          subText: `action: ${n.action.toUpperCase()}, slotId: "${n.slotId}"`,
        };
      case 'IfStatement':
        return {
          label: 'IfStatement',
          children: [
            { key: 'cond', val: n.condition },
            { key: 'then', val: n.thenStmt },
          ],
        };
      case 'Condition':
        return {
          label: 'Condition',
          subText: `${n.left} ${n.op} ${n.right}`,
        };
      case 'RepeatStatement':
        return {
          label: 'RepeatStatement',
          subText: `count: ${n.count}`,
          children: [{ key: 'body', val: n.stmt }],
        };
      case 'EmergencyOverride':
        return {
          label: 'EmergencyOverride',
          subText: `vehicle: ${n.emergencyType.toUpperCase()}`,
        };
      case 'SensorCheck':
        return {
          label: 'SensorCheck',
        };
      default:
        return { label: 'Unknown' };
    }
  };

  const { label, subText, children } = getTreeDetails(node);
  const hasChildren = children && children.length > 0;

  const getBadgeClass = (l: string) => {
    switch (l) {
      case 'Program': return 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/40';
      case 'IfStatement': return 'bg-yellow-950/80 text-yellow-400 border border-yellow-850/40';
      case 'Condition': return 'bg-amber-950/80 text-amber-400 border border-amber-800/40';
      case 'GateCommand': return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40';
      case 'SlotCommand': return 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/40';
      case 'RepeatStatement': return 'bg-purple-950/80 text-purple-400 border border-purple-800/40';
      case 'EmergencyOverride': return 'bg-red-950/80 text-red-400 border border-red-800/40 animate-pulse';
      case 'SensorCheck': return 'bg-teal-950/80 text-teal-400 border border-teal-800/40';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="flex flex-col mt-1 select-none">
      {/* Node Header */}
      <div 
        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800/40 cursor-pointer w-fit transition-colors`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
        ) : (
          <CornerDownRight className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
        )}
        
        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wide ${getBadgeClass(label)}`}>
          {label}
        </span>

        {subText && (
          <span className="text-xs text-slate-300 font-semibold bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800">
            {subText}
          </span>
        )}
        
        <span className="text-[10px] text-slate-600 font-mono">
          [L{node.line}:C{node.column}]
        </span>
      </div>

      {/* Node Children */}
      {hasChildren && isOpen && (
        <div className="pl-6 border-l border-slate-800 ml-4 flex flex-col gap-1">
          {children.map(({ key, val }) => (
            <div key={key} className="flex flex-col">
              {/* Optional label for child relations like "then" or "cond" */}
              {(key === 'cond' || key === 'then' || key === 'body') && (
                <div className="text-[10px] text-slate-400 pl-6 uppercase tracking-wider font-semibold font-mono flex items-center gap-1 mt-1 -mb-1 opacity-70">
                  <KeyRound className="w-2.5 h-2.5" />
                  <span>{key === 'cond' ? 'condition' : key === 'then' ? 'then branch' : 'repeat block'}</span>
                </div>
              )}
              <TreeNode node={val} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
