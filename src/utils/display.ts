import chalk from 'chalk';
import type { CheckResult, SuggestionResult } from '../types.js';

export function formatStatus(status: CheckResult['status']): string {
  switch (status) {
    case 'available':
      return chalk.green('✓ Available');
    case 'taken':
      return chalk.red('✗ Taken');
    case 'error':
      return chalk.yellow('? Error');
  }
}

export function formatPlatform(platform: string): string {
  const icons: Record<string, string> = {
    github: '  GitHub',
    npm: '  npm',
    pypi: '  PyPI',
    domain: '  Domain',
  };
  return icons[platform] || platform;
}

export function displayResults(name: string, results: CheckResult[]): void {
  console.log();
  console.log(chalk.bold(`Results for "${name}":`));
  console.log();

  const maxPlatformLen = Math.max(...results.map(r => {
    const displayName = r.platform === 'domain' ? r.name : formatPlatform(r.platform);
    return displayName.length;
  }));

  for (const result of results) {
    const displayName = result.platform === 'domain' ? `  ${result.name}` : formatPlatform(result.platform);
    const padding = ' '.repeat(maxPlatformLen - displayName.length + 2);
    const cached = result.cached ? chalk.dim(' (cached)') : '';
    const error = result.error ? chalk.dim(` - ${result.error}`) : '';

    console.log(`${displayName}${padding}${formatStatus(result.status)}${cached}${error}`);
  }

  // Calculate and display score
  const available = results.filter(r => r.status === 'available').length;
  const total = results.filter(r => r.status !== 'error').length;
  const score = total > 0 ? Math.round((available / total) * 100) : 0;

  console.log();
  console.log(chalk.bold(`Availability Score: ${score}%`));
  console.log();
}

export function displaySuggestions(suggestions: SuggestionResult[]): void {
  console.log();
  console.log(chalk.bold('Suggestions (sorted by availability):'));
  console.log();

  for (const suggestion of suggestions) {
    const scoreColor = suggestion.score >= 75
      ? chalk.green
      : suggestion.score >= 50
        ? chalk.yellow
        : chalk.red;

    console.log(`${chalk.bold(suggestion.name)} ${scoreColor(`(${suggestion.score}% available)`)}`);

    for (const result of suggestion.results) {
      const displayName = result.platform === 'domain' ? `    ${result.name}` : `  ${formatPlatform(result.platform)}`;
      const status = result.status === 'available'
        ? chalk.green('✓')
        : result.status === 'taken'
          ? chalk.red('✗')
          : chalk.yellow('?');
      console.log(`  ${displayName} ${status}`);
    }
    console.log();
  }
}

export function displayJsonResults(name: string, results: CheckResult[]): void {
  const available = results.filter(r => r.status === 'available').length;
  const total = results.filter(r => r.status !== 'error').length;
  const score = total > 0 ? Math.round((available / total) * 100) : 0;

  console.log(JSON.stringify({
    name,
    results,
    score,
  }, null, 2));
}

export function displayJsonSuggestions(suggestions: SuggestionResult[]): void {
  console.log(JSON.stringify(suggestions, null, 2));
}
