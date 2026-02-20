import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { Upload, Download } from 'lucide-react';
import { useRef } from 'react';

export function FileUploader() {
  const { loadCSSFromFile, exportCSS, hasChanges } = useDesignSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await loadCSSFromFile(file);
      } catch (error) {
        alert('Error loading file: ' + error);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center gap-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            <Upload size={16} />
            Upload CSS
          </button>
          <button
            onClick={() => exportCSS()}
            disabled={!hasChanges()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm hover:shadow-md disabled:shadow-none"
          >
            <Download size={16} />
            Download
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".css"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {hasChanges() && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex-shrink-0">
          <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
          Unsaved changes
        </div>
      )}
    </div>
  );
}
