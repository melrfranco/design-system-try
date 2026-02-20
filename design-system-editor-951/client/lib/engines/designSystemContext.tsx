import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileEngine } from './fileEngine';
import { ParserEngine } from './parserEngine';
import { PatchEngine } from './patchEngine';
import { InspectorEngine } from './inspectorEngine';
import { ParsedCSS, Change, Selection } from './types';

interface DesignSystemContextType {
  // Engines
  fileEngine: FileEngine;
  parserEngine: ParserEngine;
  patchEngine: PatchEngine;
  inspectorEngine: InspectorEngine;

  // State
  cssText: string;
  parsed: ParsedCSS | null;
  changes: Change[];
  selection: Selection | null;
  isDarkMode: boolean;

  // File operations
  loadCSS: (cssText: string) => void;
  loadCSSFromFile: (file: File) => Promise<void>;
  exportCSS: () => void;
  reset: () => void;
  hasChanges: () => boolean;

  // Editing
  editToken: (tokenName: string, newValue: string) => void;
  editProperty: (
    ruleSelector: string,
    propertyName: string,
    newValue: string
  ) => void;
  undo: () => void;
  redo: () => void;

  // Selection
  selectElement: (element: HTMLElement) => void;
  clearSelection: () => void;

  // Theme
  toggleDarkMode: () => void;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(
  undefined
);

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within DesignSystemProvider');
  }
  return context;
};

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileEngine] = useState(() => new FileEngine());
  const [parserEngine] = useState(() => new ParserEngine());
  const [patchEngine] = useState(() => new PatchEngine());
  const [inspectorEngine] = useState(() => new InspectorEngine());

  const [cssText, setCssText] = useState('');
  const [parsed, setParsed] = useState<ParsedCSS | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [undoneChanges, setUndoneChanges] = useState<Change[]>([]);

  // Initialize listeners
  React.useEffect(() => {
    const unsubscribe = fileEngine.onChange((current) => {
      setCssText(current);
      const parsed = parserEngine.parse(current);
      setParsed(parsed);
    });
    return unsubscribe;
  }, [fileEngine, parserEngine]);

  const loadCSS = useCallback(
    (cssText: string) => {
      fileEngine.loadCSS(cssText);
      patchEngine.reset();
      setChanges([]);
      setUndoneChanges([]);
      setSelection(null);
    },
    [fileEngine, patchEngine]
  );

  const loadCSSFromFile = useCallback(
    (file: File) => {
      return fileEngine.loadCSSFromFile(file).then(() => {
        patchEngine.reset();
        setChanges([]);
        setUndoneChanges([]);
        setSelection(null);
      });
    },
    [fileEngine, patchEngine]
  );

  const exportCSS = useCallback(() => {
    fileEngine.exportCSS();
  }, [fileEngine]);

  const reset = useCallback(() => {
    fileEngine.reset();
    patchEngine.reset();
    setChanges([]);
    setUndoneChanges([]);
    setSelection(null);
  }, [fileEngine, patchEngine]);

  const hasChanges = useCallback(() => {
    return fileEngine.hasChanges();
  }, [fileEngine]);

  const editToken = useCallback(
    (tokenName: string, newValue: string) => {
      if (!parsed) return;

      const token = parsed.tokens.find((t) => t.name === tokenName);
      if (!token) return;

      const oldValue = token.value;
      const result = patchEngine.editToken(
        cssText,
        token,
        newValue,
        oldValue
      );

      fileEngine.setCurrentCss(result.newCss);
      setChanges((prev) => [...prev, result.change]);
      setUndoneChanges([]);
    },
    [parsed, cssText, patchEngine, fileEngine]
  );

  const editProperty = useCallback(
    (ruleSelector: string, propertyName: string, newValue: string) => {
      if (!parsed) return;

      const rule = parsed.rules.find((r) => r.selector === ruleSelector);
      if (!rule) return;

      const property = rule.properties.find((p) => p.name === propertyName);
      if (!property) return;

      const oldValue = property.value;
      const result = patchEngine.editProperty(
        cssText,
        rule,
        property,
        newValue,
        oldValue
      );

      fileEngine.setCurrentCss(result.newCss);
      setChanges((prev) => [...prev, result.change]);
      setUndoneChanges([]);
    },
    [parsed, cssText, patchEngine, fileEngine]
  );

  const undo = useCallback(() => {
    const result = patchEngine.undo(cssText);
    if (result) {
      fileEngine.setCurrentCss(result.newCss);
      setChanges((prev) => prev.slice(0, -1));
      setUndoneChanges((prev) => [...prev, result.removedChange]);
    }
  }, [cssText, patchEngine, fileEngine]);

  const redo = useCallback(() => {
    if (undoneChanges.length === 0) return;

    const change = undoneChanges[undoneChanges.length - 1];
    const result = patchEngine.redo(cssText, change);
    if (result) {
      fileEngine.setCurrentCss(result.newCss);
      setChanges((prev) => [...prev, change]);
      setUndoneChanges((prev) => prev.slice(0, -1));
    }
  }, [cssText, undoneChanges, patchEngine, fileEngine]);

  const selectElement = useCallback(
    (element: HTMLElement) => {
      if (!parsed) return;

      const sel = inspectorEngine.createSelection(parsed, element);
      setSelection(sel);
    },
    [parsed, inspectorEngine]
  );

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const value: DesignSystemContextType = {
    fileEngine,
    parserEngine,
    patchEngine,
    inspectorEngine,
    cssText,
    parsed,
    changes,
    selection,
    isDarkMode,
    loadCSS,
    loadCSSFromFile,
    exportCSS,
    reset,
    hasChanges,
    editToken,
    editProperty,
    undo,
    redo,
    selectElement,
    clearSelection,
    toggleDarkMode,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
};
