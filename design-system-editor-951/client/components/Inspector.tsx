import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

export function Inspector() {
  const { selection, clearSelection, editProperty, parsed } = useDesignSystem();
  const [expandedRules, setExpandedRules] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const toggleRule = (ruleSelector: string) => {
    setExpandedRules((prev) =>
      prev.includes(ruleSelector)
        ? prev.filter((r) => r !== ruleSelector)
        : [...prev, ruleSelector]
    );
  };

  const handlePropertyEdit = (
    ruleSelector: string,
    propertyName: string,
    oldValue: string
  ) => {
    if (editValue && editValue !== oldValue) {
      editProperty(ruleSelector, propertyName, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const startEditing = (cellKey: string, currentValue: string) => {
    setEditingCell(cellKey);
    setEditValue(currentValue);
  };

  if (!selection || !selection.elementClasses) {
    return (
      <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4">
          <h2 className="font-bold text-slate-900">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-slate-500 text-sm">Click an element in the preview to inspect it</p>
          </div>
        </div>
      </div>
    );
  }

  const matchedRules = selection.matchedRules || [];

  return (
    <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-start">
        <div>
          <h2 className="font-bold text-slate-900">Inspector</h2>
          <p className="text-xs text-slate-500 mt-1">
            {selection.elementClasses?.join(', ')}
          </p>
        </div>
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Rules */}
      <div className="flex-1 overflow-auto">
        {matchedRules.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-slate-500 text-sm">No matching rules found</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {matchedRules.map((rule, idx) => {
              const ruleKey = `${rule.selector}-${idx}`;
              const isExpanded = expandedRules.includes(ruleKey);

              return (
                <div
                  key={ruleKey}
                  className="bg-white rounded border border-slate-200 overflow-hidden"
                >
                  {/* Rule header */}
                  <button
                    onClick={() => toggleRule(ruleKey)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left border-b border-slate-100"
                  >
                    {rule.properties.length > 0 && (
                      isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-slate-900 truncate">
                        {rule.selector}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rule.layer} • {rule.scope}
                      </p>
                    </div>
                  </button>

                  {/* Properties */}
                  {isExpanded && rule.properties.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200">
                      {rule.properties.map((prop, propIdx) => {
                        const cellKey = `${ruleKey}-${propIdx}`;
                        const isEditing = editingCell === cellKey;

                        return (
                          <div
                            key={cellKey}
                            className="flex gap-2 items-start px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-slate-600">
                                {prop.name}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    handlePropertyEdit(rule.selector, prop.name, prop.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handlePropertyEdit(rule.selector, prop.name, prop.value);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  autoFocus
                                  className="w-full text-xs font-mono px-2 py-1 border border-blue-400 rounded bg-white"
                                />
                              ) : (
                                <p
                                  onClick={() =>
                                    startEditing(cellKey, prop.value)
                                  }
                                  className="text-xs font-mono text-slate-900 cursor-pointer hover:text-blue-600 px-2 py-1 rounded truncate"
                                  title={prop.value}
                                >
                                  {prop.value}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info footer */}
      {matchedRules.length > 0 && (
        <div className="border-t border-slate-200 bg-white p-3 text-xs text-slate-600">
          <p className="font-medium mb-1">Cascade:</p>
          <p>
            {matchedRules.length} rule{matchedRules.length !== 1 ? 's' : ''} matched
          </p>
        </div>
      )}
    </div>
  );
}
