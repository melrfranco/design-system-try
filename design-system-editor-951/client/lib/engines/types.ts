// Token represents a CSS custom property (--variable)
export interface Token {
  name: string; // e.g., "--primary-color"
  value: string; // e.g., "#3B82F6"
  scope: 'root' | 'dark' | string; // :root, .dark, or other selector
  layer: 'theme' | 'base' | 'components' | 'utilities' | 'other';
  startLine: number;
  endLine: number;
  startChar: number;
  endChar: number;
}

// Rule represents a CSS selector block
export interface Rule {
  selector: string; // e.g., ".btn", ".dark .input"
  layer: 'theme' | 'base' | 'components' | 'utilities' | 'other';
  scope: string; // e.g., ":root", ".dark", "@media (prefers-color-scheme: dark)"
  properties: Property[];
  startLine: number;
  endLine: number;
  startChar: number;
  endChar: number;
  isNested: boolean;
}

// Property represents a single CSS property within a rule
export interface Property {
  name: string; // e.g., "background-color"
  value: string; // e.g., "var(--primary-color)"
  startLine: number;
  endLine: number;
  startChar: number;
  endChar: number;
}

// ParsedCSS is the complete parsed CSS structure
export interface ParsedCSS {
  originalText: string;
  currentText: string;
  tokens: Token[];
  rules: Rule[];
  layers: {
    theme: Rule[];
    base: Rule[];
    components: Rule[];
    utilities: Rule[];
    other: Rule[];
  };
  scopes: {
    [key: string]: {
      tokens: Token[];
      rules: Rule[];
    };
  };
}

// Change represents an edit made to the CSS
export interface Change {
  id: string;
  type: 'token' | 'property';
  selector?: string; // for properties
  tokenName?: string; // for tokens
  propertyName?: string; // for properties
  oldValue: string;
  newValue: string;
  timestamp: Date;
  appliedCharRange?: [number, number]; // the character range that was modified
}

// Selection represents what is currently selected
export interface Selection {
  type: 'token' | 'rule' | 'property' | 'element' | null;
  tokenName?: string;
  ruleSelector?: string;
  propertyName?: string;
  elementClass?: string;
  elementClasses?: string[];
  matchedRules?: Rule[];
}
