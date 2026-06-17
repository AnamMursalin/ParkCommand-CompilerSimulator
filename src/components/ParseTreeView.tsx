import React, { useState } from 'react';
import { ChevronRight, ChevronDown, KeyRound, CornerDownRight } from 'lucide-react';
import type { ProgramNode, ASTNode } from '../compiler/ast';

interface ParseTreeViewProps {
  ast: ProgramNode | null;
}

export const ParseTreeView: React.FC<ParseTreeViewProps> = ({ ast }) => {
  if (!ast) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-slate-700 text-slate-600 font-medium">
        No AST available. Write valid program and compile to view parse tree.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-700 p-5 font-mono text-base overflow-y-auto max-h-[400px]">
      <div className="text-sm text-slate-800 font-bold uppercase tracking-wide border-b border-slate-300 pb-3 mb-4">
        Abstract Syntax Tree (AST)
      </div>
      <div className="pl-2">
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

  const getBadgeClass = (l: string) => {
    switch (l) {
      case 'Program': return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
      case 'IfStatement': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Condition': return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'GateCommand': return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
      case 'SlotCommand': return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
      case 'RepeatStatement': return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'EmergencyOverride': return 'bg-red-100 text-red-700 border border-red-300 animate-pulse';
      case 'SensorCheck': return 'bg-teal-100 text-teal-700 border border-teal-300';
      default: return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  };

  const { label, subText, children } = getTreeDetails(node);
  const hasChildren = children && children.length > 0;

  return (
    <div className="flex flex-col mt-2 select-none">
      {/* Node Header */}
      <div 
        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-slate-100 cursor-pointer w-fit transition-colors`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown className="w-5 h-5 text-slate-600" /> : <ChevronRight className="w-5 h-5 text-slate-600" />
        ) : (
          <CornerDownRight className="w-4 h-4 text-slate-500 ml-2" />
        )}
        
        <span className={`px-3 py-1 rounded text-sm font-bold font-mono tracking-wide ${getBadgeClass(label)}`}>
          {label}
        </span>

        {subText && (
          <span className="text-sm text-slate-800 font-semibold bg-slate-100 px-2 py-1 rounded border border-slate-300">
            {subText}
          </span>
        )}
        
        <span className="text-xs text-slate-600 font-mono">
          [L{node.line}:C{node.column}]
        </span>
      </div>

      {/* Node Children */}
      {hasChildren && isOpen && (
        <div className="pl-8 border-l border-slate-400 ml-6 flex flex-col gap-2">
          {children.map(({ key, val }) => (
            <div key={key} className="flex flex-col">
              {/* Optional label for child relations like "then" or "cond" */}
              {(key === 'cond' || key === 'then' || key === 'body') && (
                <div className="text-xs text-slate-600 pl-8 uppercase tracking-wider font-semibold font-mono flex items-center gap-1.5 mt-2 -mb-1 opacity-70">
                  <KeyRound className="w-3.5 h-3.5" />
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
