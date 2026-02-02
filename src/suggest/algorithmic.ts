export interface SuggestionGenerator {
  generate(baseName: string): string[];
}

const PREFIXES = ['go', 'get', 'use', 'try', 'my', 'the'];
const SUFFIXES = ['hq', 'app', 'io', 'lab', 'kit', 'dev', 'hub'];

export class AlgorithmicSuggester implements SuggestionGenerator {
  generate(baseName: string): string[] {
    const suggestions = new Set<string>();

    // Original name first
    suggestions.add(baseName);

    // Prefix variations
    for (const prefix of PREFIXES) {
      suggestions.add(`${prefix}${baseName}`);
      suggestions.add(`${prefix}-${baseName}`);
    }

    // Suffix variations
    for (const suffix of SUFFIXES) {
      suggestions.add(`${baseName}${suffix}`);
      suggestions.add(`${baseName}-${suffix}`);
    }

    // Some combined variations (prefix + name + suffix) for popular combos
    const popularCombos = [
      ['go', 'hub'],
      ['get', 'app'],
      ['my', 'app'],
      ['the', 'hub'],
    ];

    for (const [prefix, suffix] of popularCombos) {
      suggestions.add(`${prefix}${baseName}${suffix}`);
    }

    return Array.from(suggestions);
  }
}

export const algorithmicSuggester = new AlgorithmicSuggester();
