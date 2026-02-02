import ora from 'ora';
import { generateSuggestions } from '../suggest/index.js';
import { displaySuggestions, displayJsonSuggestions } from '../utils/display.js';
import type { Platform, SuggestOptions } from '../types.js';

export async function suggestCommand(
  baseName: string,
  options: SuggestOptions
): Promise<void> {
  const {
    count = 10,
    platforms,
    domains,
    noCache = false,
    json = false,
  } = options;

  const isTTY = process.stdout.isTTY;
  const spinner = (json || !isTTY) ? null : ora(`Generating suggestions for "${baseName}"...`).start();

  try {
    const suggestions = await generateSuggestions(baseName, {
      platforms,
      domains,
      noCache,
    });

    spinner?.stopAndPersist({ symbol: '', text: '' });

    // Limit to requested count
    const topSuggestions = suggestions.slice(0, count);

    if (json) {
      displayJsonSuggestions(topSuggestions);
    } else {
      displaySuggestions(topSuggestions);
    }
  } catch (error) {
    spinner?.fail('Error generating suggestions');
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
