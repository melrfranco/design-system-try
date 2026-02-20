// File Engine: Stores and manages CSS text
// - Maintains originalCssText and currentCssText
// - Always has valid CSS text to render
// - Never fails - if parsing fails, still renders raw CSS

export class FileEngine {
  private originalCssText: string = '';
  private currentCssText: string = '';
  private listeners: Set<(current: string) => void> = new Set();

  constructor(initialCss: string = '') {
    this.originalCssText = initialCss;
    this.currentCssText = initialCss;
  }

  // Load CSS from string
  loadCSS(cssText: string): void {
    this.originalCssText = cssText;
    this.currentCssText = cssText;
    this.notifyListeners();
  }

  // Load CSS from file
  loadCSSFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.loadCSS(content);
        resolve();
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Get the original CSS text
  getOriginalCss(): string {
    return this.originalCssText;
  }

  // Get the current CSS text (with edits applied)
  getCurrentCss(): string {
    return this.currentCssText;
  }

  // Update the current CSS text (for patches)
  setCurrentCss(cssText: string): void {
    this.currentCssText = cssText;
    this.notifyListeners();
  }

  // Apply a patch to the CSS at specific character positions
  applyPatch(startChar: number, endChar: number, newText: string): void {
    const before = this.currentCssText.substring(0, startChar);
    const after = this.currentCssText.substring(endChar);
    this.currentCssText = before + newText + after;
    this.notifyListeners();
  }

  // Reset to original
  reset(): void {
    this.currentCssText = this.originalCssText;
    this.notifyListeners();
  }

  // Check if there are unsaved changes
  hasChanges(): boolean {
    return this.currentCssText !== this.originalCssText;
  }

  // Get diff between original and current
  getDiff(): { added: string[]; removed: string[]; modified: string[] } {
    // Simple line-by-line diff
    const originalLines = this.originalCssText.split('\n');
    const currentLines = this.currentCssText.split('\n');

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    const maxLines = Math.max(originalLines.length, currentLines.length);
    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i];
      const currLine = currentLines[i];

      if (origLine !== currLine) {
        if (!origLine) {
          added.push(currLine);
        } else if (!currLine) {
          removed.push(origLine);
        } else {
          modified.push(`${origLine} → ${currLine}`);
        }
      }
    }

    return { added, removed, modified };
  }

  // Export CSS as file
  exportCSS(filename: string = 'index.css'): void {
    const blob = new Blob([this.currentCssText], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Subscribe to changes
  onChange(callback: (current: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentCssText));
  }
}
