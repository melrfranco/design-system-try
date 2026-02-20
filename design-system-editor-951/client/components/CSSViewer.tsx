import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { useEffect, useRef } from 'react';

interface CSSViewerProps {
  highlightLines?: number[];
  scrollToLine?: number;
}

export function CSSViewer({ highlightLines = [], scrollToLine }: CSSViewerProps) {
  const { cssText } = useDesignSystem();
  const viewerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToLine && viewerRef.current) {
      const lines = viewerRef.current.querySelectorAll('.css-line');
      const targetLine = lines[scrollToLine];
      if (targetLine) {
        targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToLine]);

  const lines = cssText.split('\n');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-sm">
      <div className="flex-1 overflow-auto flex">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="bg-slate-900 text-slate-600 px-3 py-2 select-none border-r border-slate-800 flex flex-col flex-shrink-0 text-right"
        >
          {lines.map((_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code */}
        <div
          ref={viewerRef}
          className="flex-1 px-4 py-2 overflow-auto bg-slate-950"
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={`css-line h-6 leading-6 transition-colors ${
                highlightLines.includes(i)
                  ? 'bg-blue-950 border-l-2 border-blue-500 pl-2'
                  : ''
              }`}
            >
              <code className="text-slate-200">{line || '\u00A0'}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Stats footer */}
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-500 flex justify-between items-center">
        <div>
          <span>{lines.length} lines</span>
          <span className="ml-6">{cssText.length} characters</span>
        </div>
        <div className="text-slate-600">CSS Editor</div>
      </div>
    </div>
  );
}
