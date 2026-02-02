import ora from 'ora';
import { registry } from '../checkers/index.js';
import { getCached, setCache } from '../utils/cache.js';
import { displayResults, displayJsonResults } from '../utils/display.js';
import type { CheckOptions, CheckResult, Platform } from '../types.js';

export async function checkCommand(
  name: string,
  options: CheckOptions
): Promise<void> {
  const { platforms, domains, noCache = false, json = false } = options;

  const checkers = registry.getCheckers(platforms, domains);

  if (checkers.length === 0) {
    console.error('No checkers available for the specified platforms');
    process.exit(1);
  }

  const isTTY = process.stdout.isTTY;
  const spinner = (json || !isTTY) ? null : ora(`Checking availability for "${name}"...`).start();

  try {
    const results: CheckResult[] = [];

    // Run all checks in parallel
    const checkPromises = checkers.map(async (checker) => {
      // Check cache first (unless disabled)
      if (!noCache) {
        const displayName = checker.name === 'domain' ? name : name;
        const cached = getCached(checker.name, displayName);
        if (cached) {
          return cached;
        }
      }

      const result = await checker.check(name);

      // Cache the result (unless disabled)
      if (!noCache) {
        setCache(result);
      }

      return result;
    });

    const checkResults = await Promise.all(checkPromises);
    results.push(...checkResults);

    spinner?.stopAndPersist({ symbol: '', text: '' });

    if (json) {
      displayJsonResults(name, results);
    } else {
      displayResults(name, results);
    }
  } catch (error) {
    spinner?.fail('Error checking availability');
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message);
    process.exit(1);
  }
}

export function parsePlatforms(value: string): Platform[] {
  return value.split(',').map(p => p.trim()) as Platform[];
}

export function parseDomains(value: string): string[] {
  return value.split(',').map(d => d.trim().replace(/^\./, ''));
}
