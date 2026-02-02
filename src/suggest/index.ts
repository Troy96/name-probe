import { algorithmicSuggester } from './algorithmic.js';
import { registry } from '../checkers/index.js';
import { getCached, setCache } from '../utils/cache.js';
import type { CheckResult, Platform, SuggestionResult } from '../types.js';
import type { Checker } from '../checkers/base.js';

export interface SuggestEngineOptions {
  platforms?: Platform[];
  domains?: string[];
  noCache?: boolean;
  maxConcurrent?: number;
}

async function checkName(
  name: string,
  checkers: Checker[],
  noCache: boolean
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const checker of checkers) {
    // Check cache first
    if (!noCache) {
      const cached = getCached(checker.name, name);
      if (cached) {
        results.push(cached);
        continue;
      }
    }

    const result = await checker.check(name);

    // Cache the result
    if (!noCache) {
      setCache(result);
    }

    results.push(result);
  }

  return results;
}

function calculateScore(results: CheckResult[]): number {
  const available = results.filter(r => r.status === 'available').length;
  const total = results.filter(r => r.status !== 'error').length;
  return total > 0 ? Math.round((available / total) * 100) : 0;
}

export async function generateSuggestions(
  baseName: string,
  options: SuggestEngineOptions = {}
): Promise<SuggestionResult[]> {
  const { platforms, domains, noCache = false, maxConcurrent = 3 } = options;

  // Generate name variations
  const variations = algorithmicSuggester.generate(baseName);
  const checkers = registry.getCheckers(platforms, domains);

  const results: SuggestionResult[] = [];

  // Process variations in batches to avoid overwhelming the APIs
  for (let i = 0; i < variations.length; i += maxConcurrent) {
    const batch = variations.slice(i, i + maxConcurrent);

    const batchResults = await Promise.all(
      batch.map(async (name) => {
        const checkResults = await checkName(name, checkers, noCache);
        return {
          name,
          results: checkResults,
          score: calculateScore(checkResults),
        };
      })
    );

    results.push(...batchResults);
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results;
}

export { algorithmicSuggester };
