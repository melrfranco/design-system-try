import { Change, Token, Rule, Property } from './types';

// Patch Engine: Applies deterministic edits to CSS
// - Changes only specific property value ranges or insertions
// - Preserves selector identifiers and order
// - Never reformats entire file
// - Applies patches in reverse order of indices
// - Preserves @import, URLs, comments, whitespace

export class PatchEngine {
  private changes: Change[] = [];

  constructor() {
    this.changes = [];
  }

  // Edit a token value
  editToken(
    cssText: string,
    token: Token,
    newValue: string,
    _oldValue: string
  ): { newCss: string; change: Change } {
    // Find the exact range of the value in the token
    const tokenLine = cssText.split('\n')[token.startLine];
    const valueMatch = tokenLine.match(/--[a-zA-Z0-9-]+\s*:\s*([^;]+);/);

    if (!valueMatch) {
      throw new Error('Cannot find token value to edit');
    }

    // Calculate the actual character position of the value
    const valueStart = token.startChar + tokenLine.indexOf(valueMatch[1]);
    const valueEnd = valueStart + valueMatch[1].length;

    const before = cssText.substring(0, valueStart);
    const after = cssText.substring(valueEnd);
    const newCss = before + newValue + after;

    const change: Change = {
      id: `change-${Date.now()}-${Math.random()}`,
      type: 'token',
      tokenName: token.name,
      oldValue: _oldValue,
      newValue,
      timestamp: new Date(),
      appliedCharRange: [valueStart, valueEnd],
    };

    this.changes.push(change);
    return { newCss, change };
  }

  // Edit a property value
  editProperty(
    cssText: string,
    rule: Rule,
    property: Property,
    newValue: string,
    _oldValue: string
  ): { newCss: string; change: Change } {
    // Find the exact range of the property value
    const propertyLine = cssText.split('\n')[property.startLine];
    const propMatch = propertyLine.match(
      new RegExp(`${property.name}\\s*:\\s*([^;]+);`)
    );

    if (!propMatch) {
      throw new Error('Cannot find property value to edit');
    }

    // Calculate the actual character position of the value
    const valueStart = property.startChar + propertyLine.indexOf(propMatch[1]);
    const valueEnd = valueStart + propMatch[1].length;

    const before = cssText.substring(0, valueStart);
    const after = cssText.substring(valueEnd);
    const newCss = before + newValue + after;

    const change: Change = {
      id: `change-${Date.now()}-${Math.random()}`,
      type: 'property',
      selector: rule.selector,
      propertyName: property.name,
      oldValue: _oldValue,
      newValue,
      timestamp: new Date(),
      appliedCharRange: [valueStart, valueEnd],
    };

    this.changes.push(change);
    return { newCss, change };
  }

  // Undo the last change
  undo(cssText: string): { newCss: string; removedChange: Change } | null {
    if (this.changes.length === 0) return null;

    const change = this.changes.pop()!;

    // Reverse the patch
    if (change.appliedCharRange) {
      const [start, end] = change.appliedCharRange;
      const before = cssText.substring(0, start);
      const after = cssText.substring(start + change.newValue.length);
      const newCss = before + change.oldValue + after;
      return { newCss, removedChange: change };
    }

    return null;
  }

  // Redo the last undone change
  redo(cssText: string, change: Change): { newCss: string } | null {
    if (!change.appliedCharRange) return null;

    const [start, end] = change.appliedCharRange;
    const before = cssText.substring(0, start);
    const after = cssText.substring(start + change.oldValue.length);
    const newCss = before + change.newValue + after;

    this.changes.push(change);
    return { newCss };
  }

  // Get all changes made
  getChanges(): Change[] {
    return [...this.changes];
  }

  // Reset all changes
  reset(): void {
    this.changes = [];
  }

  // Apply multiple patches in reverse order (to preserve indices)
  applyPatches(
    cssText: string,
    patches: Array<{ start: number; end: number; newText: string }>
  ): string {
    // Sort patches in reverse order to apply from end to beginning
    const sortedPatches = [...patches].sort((a, b) => b.start - a.start);

    let result = cssText;
    for (const patch of sortedPatches) {
      const before = result.substring(0, patch.start);
      const after = result.substring(patch.end);
      result = before + patch.newText + after;
    }

    return result;
  }
}
