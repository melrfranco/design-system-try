import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { useRef, useEffect } from 'react';

export function Playground() {
  const { cssText, isDarkMode, selectElement } = useDesignSystem();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Click handler for element selection
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target !== containerRef.current) {
        selectElement(target);
        e.stopPropagation();
      }
    };

    containerRef.current.addEventListener('click', handleClick);
    return () => {
      containerRef.current?.removeEventListener('click', handleClick);
    };
  }, [selectElement]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-auto ${isDarkMode ? 'dark' : ''}`}
      style={{
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        backgroundImage: isDarkMode
          ? 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 1px)'
          : 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}
    >
      <style>{cssText}</style>

      <div className={`${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <div className="p-8 space-y-12 max-w-6xl mx-auto">
          {/* Token showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Design System Tokens</h2>
            
            {/* Color palette */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Colors</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-16 rounded bg-slate-50 border border-slate-200"></div>
                  <p className="text-sm text-slate-600">Slate 50</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-slate-500 border border-slate-200"></div>
                  <p className="text-sm text-slate-600">Slate 500</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-slate-900 border border-slate-200"></div>
                  <p className="text-sm text-slate-600">Slate 900</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-blue-500 border border-slate-200"></div>
                  <p className="text-sm text-slate-600">Blue 500</p>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Typography</h3>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Heading 1 (30px, Bold)</h1>
                <h2 className="text-2xl font-bold">Heading 2 (24px, Bold)</h2>
                <p className="text-base">Body text (16px, Regular)</p>
                <small className="text-sm text-slate-600">Small text (14px, Regular)</small>
              </div>
            </div>
          </section>

          {/* Component examples */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Component Examples</h2>

            {/* Buttons */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-slate-200 text-slate-900 rounded hover:bg-slate-300">
                  Secondary Button
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Destructive Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Cards</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-white">
                  <h4 className="font-semibold mb-2">Card Title</h4>
                  <p className="text-slate-600 text-sm">Card content goes here</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="font-semibold mb-2">Muted Card</h4>
                  <p className="text-slate-600 text-sm">Subtle background</p>
                </div>
              </div>
            </div>

            {/* Forms */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Form Elements</h3>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Text Input</label>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Grid utilities */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Grid & Layout</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-100 rounded text-center text-sm font-medium">Col 1/3</div>
              <div className="p-4 bg-slate-100 rounded text-center text-sm font-medium">Col 1/3</div>
              <div className="p-4 bg-slate-100 rounded text-center text-sm font-medium">Col 1/3</div>
            </div>
          </section>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-900">
            <p className="text-sm font-medium">💡 Tip: Click any element above to inspect its styles and edit the CSS rules</p>
          </div>
        </div>
      </div>
    </div>
  );
}
