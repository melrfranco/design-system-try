import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { RotateCcw, RotateCw, Trash2 } from 'lucide-react';

export function ChangeLog() {
  const { changes, undo, redo, reset } = useDesignSystem();

  return (
    <div className="bg-white border-t border-slate-200 p-4 max-h-48 overflow-auto">
      <div className="flex justify-between items-center mb-4 gap-4">
        <h3 className="font-bold text-slate-900">Change History</h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => undo()}
            disabled={changes.length === 0}
            className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <RotateCcw size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => redo()}
            disabled={changes.length === 0}
            className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <RotateCw size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => reset()}
            disabled={changes.length === 0}
            className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset all changes"
          >
            <Trash2 size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      {changes.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No changes yet. Start editing to see changes here.</p>
      ) : (
        <div className="space-y-2">
          {changes.map((change) => (
            <div
              key={change.id}
              className="bg-slate-50 p-3 rounded border border-slate-200 text-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-slate-900 truncate font-medium">
                    {change.type === 'token'
                      ? change.tokenName
                      : `${change.selector}`}
                  </p>
                  {change.propertyName && (
                    <p className="text-slate-600 text-xs mt-0.5">
                      {change.propertyName}
                    </p>
                  )}
                  <div className="text-slate-600 mt-1.5 space-y-0.5">
                    <p>
                      <span className="line-through text-red-500">{change.oldValue}</span>
                    </p>
                    <p>
                      <span className="text-green-600 font-medium">{change.newValue}</span>
                    </p>
                  </div>
                </div>
                <p className="text-slate-400 whitespace-nowrap text-xs flex-shrink-0">
                  {change.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
