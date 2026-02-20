import { ParsedCSS, Rule, Selection } from './types';

// Inspector Engine: Handles element selection and rule matching
// - Click element in preview to select and focus corresponding rules
// - Determine matched rules from parsed index in cascade order
// - Show breadcrumb: Layer → Scope → Selector

export class InspectorEngine {
  // Get the computed rules for an element
  getComputedRules(parsed: ParsedCSS, classList: string[]): Rule[] {
    const matched: Rule[] = [];

    // Iterate through all rules and check if they match the element's classes
    for (const rule of parsed.rules) {
      if (this.selectorMatches(rule.selector, classList)) {
        matched.push(rule);
      }
    }

    // Sort by specificity (cascade order)
    matched.sort((a, b) => {
      const specA = this.calculateSpecificity(a.selector);
      const specB = this.calculateSpecificity(b.selector);
      return specA - specB;
    });

    return matched;
  }

  // Check if a selector matches the element's classes
  private selectorMatches(selector: string, classList: string[]): boolean {
    // Handle simple class selectors
    for (const className of classList) {
      if (selector === `.${className}` || selector.includes(`.${className}`)) {
        return true;
      }
    }

    // Handle combined selectors
    const parts = selector.split(/[\s,>/+~]/);
    for (const part of parts) {
      const cleanPart = part.trim();
      for (const className of classList) {
        if (cleanPart === `.${className}`) {
          return true;
        }
      }
    }

    return false;
  }

  // Calculate CSS specificity
  private calculateSpecificity(selector: string): number {
    let specificity = 0;

    // Count IDs
    specificity += (selector.match(/#/g) || []).length * 100;

    // Count classes, attributes, and pseudo-classes
    specificity += (selector.match(/\./g) || []).length * 10;
    specificity += (selector.match(/\[/g) || []).length * 10;
    specificity += (selector.match(/:/g) || []).length * 10;

    // Count elements
    specificity += (selector.match(/[a-z]/i) || []).length;

    return specificity;
  }

  // Get the breadcrumb for a rule
  getBreadcrumb(rule: Rule): { layer: string; scope: string; selector: string } {
    return {
      layer: rule.layer,
      scope: rule.scope,
      selector: rule.selector,
    };
  }

  // Create a selection from element click
  createSelection(
    parsed: ParsedCSS,
    element: HTMLElement
  ): Selection | null {
    const classes = Array.from(element.classList);

    if (classes.length === 0) {
      return null;
    }

    const matchedRules = this.getComputedRules(parsed, classes);

    return {
      type: 'element',
      elementClasses: classes,
      elementClass: classes[0],
      matchedRules,
    };
  }

  // Find the topmost rule in cascade for a property
  getTopRule(rules: Rule[], propertyName: string): Rule | null {
    const reversed = [...rules].reverse();
    for (const rule of reversed) {
      const hasProp = rule.properties.some(
        (p) => p.name.toLowerCase() === propertyName.toLowerCase()
      );
      if (hasProp) {
        return rule;
      }
    }
    return null;
  }

  // Find all rules that define a property
  getRulesForProperty(rules: Rule[], propertyName: string): Rule[] {
    return rules.filter((rule) =>
      rule.properties.some(
        (p) => p.name.toLowerCase() === propertyName.toLowerCase()
      )
    );
  }

  // Get override information for a property
  getPropertyOverride(
    rules: Rule[],
    propertyName: string
  ): { topRule: Rule | null; isOverridden: boolean; overridingRules: Rule[] } {
    const allRules = this.getRulesForProperty(rules, propertyName);
    const topRule = this.getTopRule(rules, propertyName);

    return {
      topRule,
      isOverridden: allRules.length > 1,
      overridingRules: allRules.filter((r) => r !== topRule),
    };
  }
}
