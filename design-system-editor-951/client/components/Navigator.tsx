import { useDesignSystem } from '@/lib/engines/designSystemContext';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function Navigator() {
  const { parsed } = useDesignSystem();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'theme',
    'base',
    'components',
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  if (!parsed) {
    return (
      <div className="w-64 bg-slate-50 border-r border-slate-200 p-4">
        <p className="text-slate-500 text-sm">Load a CSS file to see structure</p>
      </div>
    );
  }

  const sections = [
    {
      name: 'Theme Tokens',
      key: 'theme',
      items: parsed.tokens.filter((t) => t.layer === 'theme'),
      type: 'tokens' as const,
    },
    {
      name: 'Base Rules',
      key: 'base',
      items: parsed.layers.base,
      type: 'rules' as const,
    },
    {
      name: 'Component Rules',
      key: 'components',
      items: parsed.layers.components,
      type: 'rules' as const,
    },
    {
      name: 'Utilities',
      key: 'utilities',
      items: parsed.layers.utilities,
      type: 'rules' as const,
    },
    {
      name: 'Dark Overrides',
      key: 'dark',
      items: parsed.rules.filter((r) => r.scope === '.dark'),
      type: 'rules' as const,
    },
  ];

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 overflow-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
        <h2 className="font-bold text-slate-900">Structure</h2>
        <p className="text-xs text-slate-500 mt-1">
          {parsed.tokens.length} tokens • {parsed.rules.length} rules
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 space-y-1">
          {sections.map((section) => {
            const isExpanded = expandedSections.includes(section.key);
            const hasItems = section.items.length > 0;

            return (
              <div key={section.key}>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-200 text-left text-sm font-medium text-slate-900 transition-colors"
                >
                  {hasItems && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                  <span className="truncate">
                    {section.name}
                  </span>
                  <span className="ml-auto text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    {section.items.length}
                  </span>
                </button>

                {isExpanded && hasItems && (
                  <div className="space-y-0.5">
                    {section.items.map((item, i) => {
                      const itemKey = `${section.key}-${i}`;
                      if (section.type === 'tokens') {
                        const token = item as any;
                        return (
                          <button
                            key={itemKey}
                            className="w-full text-left px-4 py-1.5 text-xs rounded hover:bg-slate-200 truncate text-slate-700 hover:text-slate-900 transition-colors font-mono"
                            title={`${token.name}: ${token.value}`}
                          >
                            {token.name}
                          </button>
                        );
                      } else {
                        const rule = item as any;
                        return (
                          <button
                            key={itemKey}
                            className="w-full text-left px-4 py-1.5 text-xs rounded hover:bg-slate-200 truncate text-slate-700 hover:text-slate-900 transition-colors font-mono"
                            title={rule.selector}
                          >
                            {rule.selector}
                          </button>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-slate-200 bg-white p-4 text-xs text-slate-600">
        <div className="space-y-1">
          <p>Scopes: {Object.keys(parsed.scopes).length}</p>
          <p>Layers: {Object.values(parsed.layers).filter((l) => l.length > 0).length}</p>
        </div>
      </div>
    </div>
  );
}
