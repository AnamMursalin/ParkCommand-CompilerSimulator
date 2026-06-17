import React from 'react';
import { Copy, Check } from 'lucide-react';

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
          <span className="text-yellow-600 font-bold">{parts[0]}:</span>
          <span className="text-slate-600">{parts.slice(1).join(':')}</span>
        </span>
      );
    }

    // GOTO labels
    let highlighted: React.ReactNode = line;
    if (line.includes('GOTO')) {
      const parts = line.split('GOTO');
      highlighted = (
        <span>
          <span className="text-slate-700">{parts[0]}</span>
          <span className="text-purple-600 font-bold">GOTO</span>
          <span className="text-yellow-600 font-bold">{parts[1]}</span>
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
          <span className="text-cyan-600 font-bold">IF </span>
          <span className="text-slate-600">{parts[1]}</span>
        </span>
      );
    }

    // Commands/Operations
    if (line.startsWith('RESERVE_SLOT') || line.startsWith('RELEASE_SLOT')) {
      const parts = line.split(' ');
      return (
        <span>
          <span className="text-indigo-600 font-bold">{parts[0]}</span>{' '}
          <span className="text-slate-700 font-semibold">{parts.slice(1).join(' ')}</span>
        </span>
      );
    }

    if (line.startsWith('GATE_OPEN') || line.startsWith('GATE_CLOSE')) {
      return <span className="text-emerald-600 font-bold">{line}</span>;
    }

    if (line.startsWith('EMERGENCY_OVERRIDE')) {
      const parts = line.split(' ');
      return (
        <span>
          <span className="text-red-600 font-bold">{parts[0]}</span>{' '}
          <span className="text-orange-600 font-bold">{parts[1]}</span>{' '}
          <span className="text-slate-600">{parts.slice(2).join(' ')}</span>
        </span>
      );
    }

    if (line.startsWith('ZONE') || line.startsWith('END_ZONE')) {
      return <span className="text-pink-600 font-bold">{line}</span>;
    }

    return <span className="text-slate-600">{line}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-700 overflow-hidden font-mono text-base">
      {/* IR Toolbar */}
      <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-300">
        <div className="text-sm text-slate-800 uppercase font-bold tracking-wider">
          Intermediate Representation (3-Address Code)
        </div>
        {ir.length > 0 && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-800 hover:text-slate-900 bg-slate-100 border border-slate-400 rounded-lg hover:border-slate-500 transition-all active:scale-95"
            title="Copy IR Code"
          >
            {copied ? (
              <>
                <Check className="w-4.5 h-4.5 text-emerald-700" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4.5 h-4.5" />
                <span>Copy IR</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code Listing */}
      <div className="p-5 overflow-y-auto max-h-[350px] leading-7 select-text">
        {ir.length === 0 ? (
          <div className="py-8 text-center text-slate-600 font-medium">
            No intermediate code generated. Compile a valid program.
          </div>
        ) : (
          <div className="flex flex-col">
            {ir.map((line, idx) => (
              <div key={idx} className="flex hover:bg-slate-50 px-3 py-1 rounded transition-colors group">
                <span className="w-10 select-none text-slate-500 text-sm text-right pr-4 font-mono opacity-50 group-hover:opacity-100">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre pl-2">
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
