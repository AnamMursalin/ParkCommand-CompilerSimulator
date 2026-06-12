import React from 'react';
import { FileCode, Copy, Check } from 'lucide-react';

interface IntermediateCodeViewProps {
  ir: string[];
}

export const IntermediateCodeView: React.FC<IntermediateCodeViewProps> = ({ ir }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ir.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightIRLine = (line: string) => {
    // Label definition: e.g. "L1:"
    if (line.match(/^L\d+:/)) {
      const parts = line.split(':');
      return (
        <span>
          <span className="text-yellow-450 font-bold">{parts[0]}:</span>
          <span className="text-slate-300">{parts.slice(1).join(':')}</span>
        </span>
      );
    }

    // GOTO labels
    let highlighted: React.ReactNode = line;
    if (line.includes('GOTO')) {
      const parts = line.split('GOTO');
      highlighted = (
        <span>
          <span className="text-slate-200">{parts[0]}</span>
          <span className="text-purple-400 font-bold">GOTO</span>
          <span className="text-yellow-400 font-bold">{parts[1]}</span>
        </span>
      );
    }

    // IF keyword
    if (line.startsWith('IF')) {
      const text = typeof highlighted === 'string' ? highlighted : line;
      // We can split by IF and render
      const parts = text.split('IF ');
      return (
        <span>
          <span className="text-cyan-400 font-bold">IF </span>
          <span className="text-slate-350">{parts[1]}</span>
        </span>
      );
    }

    // Commands/Operations
    if (line.startsWith('RESERVE_SLOT') || line.startsWith('RELEASE_SLOT')) {
      const parts = line.split(' ');
      return (
        <span>
          <span className="text-indigo-400 font-bold">{parts[0]}</span>{' '}
          <span className="text-slate-200 font-semibold">{parts.slice(1).join(' ')}</span>
        </span>
      );
    }

    if (line.startsWith('GATE_OPEN') || line.startsWith('GATE_CLOSE')) {
      return <span className="text-emerald-450 font-bold">{line}</span>;
    }

    if (line.startsWith('EMERGENCY_OVERRIDE')) {
      const parts = line.split(' ');
      return (
        <span>
          <span className="text-red-500 font-bold">{parts[0]}</span>{' '}
          <span className="text-orange-400 font-bold">{parts[1]}</span>{' '}
          <span className="text-slate-300">{parts.slice(2).join(' ')}</span>
        </span>
      );
    }

    if (line.startsWith('ZONE') || line.startsWith('END_ZONE')) {
      return <span className="text-pink-400 font-bold">{line}</span>;
    }

    return <span className="text-slate-300">{line}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm">
      {/* IR Toolbar */}
      <div className="flex justify-between items-center p-2.5 bg-slate-950 border-b border-slate-850">
        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase font-bold tracking-wider">
          <FileCode className="w-4 h-4 text-purple-400" />
          <span>Intermediate Representation (3-Address Code)</span>
        </div>
        {ir.length > 0 && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all active:scale-95"
            title="Copy IR Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy IR</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code Listing */}
      <div className="p-4 overflow-y-auto max-h-[300px] leading-6 select-text">
        {ir.length === 0 ? (
          <div className="py-6 text-center text-slate-500 font-medium">
            No intermediate code generated. Compile a valid program.
          </div>
        ) : (
          <div className="flex flex-col">
            {ir.map((line, idx) => (
              <div key={idx} className="flex hover:bg-slate-850/20 px-2 py-0.5 rounded transition-colors group">
                <span className="w-8 select-none text-slate-655 text-xs text-right pr-3 font-mono opacity-50 group-hover:opacity-100">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre pl-1">
                  {highlightIRLine(line)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
