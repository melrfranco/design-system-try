import { Token, Rule, Property, ParsedCSS } from './types';

// Parser Engine: Parses CSS string into structured data
// - Extracts tokens (--variables), rules, layers, scopes
// - Layer-aware and tolerant (never fails)
// - Derives organization from CSS structure, not naming assumptions

export class ParserEngine {
  private removeComments(css: string): string {
    // Remove CSS comments /* ... */
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  parse(cssText: string): ParsedCSS {
    const tokens: Token[] = [];
    const rules: Rule[] = [];
    const scopes: { [key: string]: { tokens: Token[]; rules: Rule[] } } = {};

    // Initialize scopes
    const initializeScope = (scopeName: string) => {
      if (!scopes[scopeName]) {
        scopes[scopeName] = { tokens: [], rules: [] };
      }
    };

    // Default scopes
    initializeScope(':root');
    initializeScope('.dark');

    try {
      // Process CSS string
      const cleanCss = this.removeComments(cssText);
      const lines = cleanCss.split('\n');

      let currentLayer: 'theme' | 'base' | 'components' | 'utilities' | 'other' = 'other';
      let currentScope = ':root';
      let inRule = false;
      let currentRule: Partial<Rule> | null = null;
      let ruleStartLine = 0;
      let ruleStartChar = 0;
      let charCount = 0;

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const trimmed = line.trim();
        const lineStartChar = charCount;

        // Skip empty lines
        if (!trimmed) {
          charCount += line.length + 1;
          continue;
        }

        // Detect layer declarations
        const layerMatch = trimmed.match(/@layer\s+(theme|base|components|utilities)/);
        if (layerMatch) {
          currentLayer = layerMatch[1] as any;
          charCount += line.length + 1;
          continue;
        }

        // Detect scope/selector context
        if (trimmed.includes(':root') && !trimmed.includes('}')) {
          currentScope = ':root';
        } else if (trimmed.includes('.dark') && !trimmed.includes('}')) {
          currentScope = '.dark';
        } else if (trimmed.includes('@media')) {
          currentScope = '@media';
        }

        // Parse tokens (--variable: value;)
        if (trimmed.includes('--') && trimmed.includes(':') && !inRule) {
          const tokenMatches = trimmed.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g);
          for (const tokenMatch of tokenMatches) {
            const tokenName = '--' + tokenMatch[1];
            const tokenValue = tokenMatch[2].trim();

            const token: Token = {
              name: tokenName,
              value: tokenValue,
              scope: currentScope,
              layer: currentLayer,
              startLine: lineNum,
              endLine: lineNum,
              startChar: lineStartChar + (tokenMatch.index || 0),
              endChar: lineStartChar + (tokenMatch.index || 0) + tokenMatch[0].length,
            };

            tokens.push(token);
            initializeScope(currentScope);
            scopes[currentScope].tokens.push(token);
          }
        }

        // Parse rule opening
        if (trimmed.includes('{') && !trimmed.includes('}')) {
          inRule = true;
          const selectorMatch = trimmed.match(/^([^{]+){/);
          if (selectorMatch) {
            const selector = selectorMatch[1].trim();
            ruleStartLine = lineNum;
            ruleStartChar = lineStartChar;

            currentRule = {
              selector,
              layer: currentLayer,
              scope: currentScope,
              properties: [],
              startLine: ruleStartLine,
              endLine: lineNum,
              startChar: ruleStartChar,
              endChar: lineStartChar + line.length,
              isNested: false,
            };
          }
        }

        // Parse properties
        if (inRule && trimmed.includes(':') && !trimmed.includes('{')) {
          const propMatch = trimmed.match(/^\s*([a-z-]+)\s*:\s*(.+?)(?:;|$)/i);
          if (propMatch && currentRule) {
            const propName = propMatch[1].trim();
            let propValue = propMatch[2].trim();
            // Remove trailing semicolon if exists
            if (propValue.endsWith(';')) {
              propValue = propValue.slice(0, -1).trim();
            }

            const property: Property = {
              name: propName,
              value: propValue,
              startLine: lineNum,
              endLine: lineNum,
              startChar: lineStartChar + (propMatch.index || 0),
              endChar: lineStartChar + line.length,
            };

            currentRule.properties!.push(property);
            if (currentRule.endLine !== undefined) {
              currentRule.endLine = lineNum;
              currentRule.endChar = lineStartChar + line.length;
            }
          }
        }

        // Parse rule closing
        if (trimmed.includes('}')) {
          inRule = false;
          if (currentRule && currentRule.selector) {
            currentRule.endLine = lineNum;
            currentRule.endChar = lineStartChar + line.length;

            const rule = currentRule as Rule;
            rules.push(rule);
            initializeScope(currentScope);
            scopes[currentScope].rules.push(rule);
          }
          currentRule = null;
        }

        charCount += line.length + 1;
      }

      // Organize rules by layer
      const layers = {
        theme: rules.filter((r) => r.layer === 'theme'),
        base: rules.filter((r) => r.layer === 'base'),
        components: rules.filter((r) => r.layer === 'components'),
        utilities: rules.filter((r) => r.layer === 'utilities'),
        other: rules.filter((r) => r.layer === 'other'),
      };

      return {
        originalText: cssText,
        currentText: cssText,
        tokens,
        rules,
        layers,
        scopes,
      };
    } catch (error) {
      console.error('Parser error:', error);
      // Return minimal valid structure on error
      return {
        originalText: cssText,
        currentText: cssText,
        tokens: [],
        rules: [],
        layers: { theme: [], base: [], components: [], utilities: [], other: [] },
        scopes: { ':root': { tokens: [], rules: [] } },
      };
    }
  }

  // Find tokens that match a search query
  findTokens(parsed: ParsedCSS, query: string): Token[] {
    return parsed.tokens.filter(
      (t) =>
        t.name.includes(query) ||
        t.value.includes(query) ||
        t.scope.includes(query)
    );
  }

  // Find rules that match a search query
  findRules(parsed: ParsedCSS, query: string): Rule[] {
    return parsed.rules.filter((r) => r.selector.includes(query));
  }

  // Get rules that apply to an element
  getMatchingRules(parsed: ParsedCSS, classes: string[]): Rule[] {
    const matching: Rule[] = [];

    for (const rule of parsed.rules) {
      for (const className of classes) {
        if (rule.selector.includes(`.${className}`) || rule.selector === className) {
          matching.push(rule);
        }
      }
    }

    return matching;
  }
}
