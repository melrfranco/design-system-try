import { DesignSystemProvider } from '@/lib/engines/designSystemContext';
import { FileUploader } from '@/components/FileUploader';
import { Navigator } from '@/components/Navigator';
import { Playground } from '@/components/Playground';
import { Inspector } from '@/components/Inspector';
import { CSSViewer } from '@/components/CSSViewer';
import { ChangeLog } from '@/components/ChangeLog';
import { useState, useRef } from 'react';
import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { Eye, Code } from 'lucide-react';

function DesignLabContent() {
  const { toggleDarkMode, isDarkMode, cssText, loadCSS } = useDesignSystem();
  const [viewMode, setViewMode] = useState<'preview' | 'css'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSampleCSS = async () => {
    try {
      const response = await fetch('/sample-design-system.css');
      const css = await response.text();
      loadCSS(css);
    } catch (error) {
      console.error('Error loading sample CSS:', error);
    }
  };

  // Show welcome screen if no CSS loaded
  if (!cssText) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Top bar */}
        <FileUploader />

        {/* Welcome screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🎨</span>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Blueprint Design Lab</h1>
                <p className="text-xl text-slate-600 mt-2">
                  Visualize, edit, and export your design system CSS
                </p>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-3">
                <span className="text-3xl">📁</span>
                <h3 className="font-semibold text-slate-900">Upload CSS</h3>
                <p className="text-sm text-slate-600">Import your design system file</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-3">
                <span className="text-3xl">👁️</span>
                <h3 className="font-semibold text-slate-900">Live Preview</h3>
                <p className="text-sm text-slate-600">See changes instantly</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-3">
                <span className="text-3xl">✏️</span>
                <h3 className="font-semibold text-slate-900">Edit & Export</h3>
                <p className="text-sm text-slate-600">Modify and download your CSS</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-600 font-medium uppercase tracking-wide">Get Started</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  📤 Upload Your CSS
                </button>
                <button
                  onClick={loadSampleCSS}
                  className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  🚀 Load Sample
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".css"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const css = ev.target?.result as string;
                      loadCSS(css);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <h3 className="font-semibold text-blue-900">How it works:</h3>
              <ul className="text-sm text-blue-900 space-y-2">
                <li>✓ Upload your Blueprint design system CSS file</li>
                <li>✓ Browse the parsed structure in the left navigator</li>
                <li>✓ Click elements in the preview to inspect their rules</li>
                <li>✓ Edit token values and properties with instant preview</li>
                <li>✓ Download the modified CSS when ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Top bar */}
      <FileUploader />

      {/* Main layout */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left: Navigator */}
        <Navigator />

        {/* Center: Preview or CSS Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Controls */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                  viewMode === 'preview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                onClick={() => setViewMode('css')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                  viewMode === 'css'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Code size={14} />
                CSS
              </button>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`px-3 py-1 rounded text-sm font-medium ${
                isDarkMode
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-900'
              }`}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'preview' ? <Playground /> : <CSSViewer />}
          </div>

          {/* Bottom: Change log */}
          <ChangeLog />
        </div>

        {/* Right: Inspector */}
        <Inspector />
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <DesignSystemProvider>
      <DesignLabContent />
    </DesignSystemProvider>
  );
}
