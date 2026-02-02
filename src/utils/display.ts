import chalk from 'chalk';
import type { CheckResult, SuggestionResult } from '../types.js';

// Professional muted color palette
const colors = {
  border: chalk.gray,
  header: chalk.white.bold,
  label: chalk.white,
  muted: chalk.dim,
  available: chalk.hex('#10B981'),  // Muted green
  taken: chalk.hex('#6B7280'),       // Gray
  error: chalk.hex('#F59E0B'),       // Amber
  scoreHigh: chalk.hex('#10B981'),   // Green
  scoreMed: chalk.hex('#F59E0B'),    // Amber
  scoreLow: chalk.hex('#EF4444'),    // Red
};

export function formatStatus(status: CheckResult['status']): string {
  switch (status) {
    case 'available':
      return colors.available('● Available');
    case 'taken':
      return colors.taken('○ Taken');
    case 'error':
      return colors.error('⚠ Error');
  }
}

export function formatPlatform(platform: string): string {
  const names: Record<string, string> = {
    github: 'GitHub',
    npm: 'npm',
    pypi: 'PyPI',
    domain: 'Domain',
    instagram: 'Instagram',
    x: 'X',
  };
  return names[platform] || platform;
}

function renderScoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;

  const color = score >= 75 ? colors.scoreHigh : score >= 50 ? colors.scoreMed : colors.scoreLow;
  return color('━'.repeat(filled)) + colors.muted('━'.repeat(empty));
}

function getScoreColor(score: number) {
  return score >= 75 ? colors.scoreHigh : score >= 50 ? colors.scoreMed : colors.scoreLow;
}

export function displayResults(name: string, results: CheckResult[]): void {
  const width = 52;
  const line = colors.border('─'.repeat(width));

  console.log();
  console.log(line);
  console.log(colors.header(`  ${name}`));
  console.log(line);
  console.log();

  // Calculate max platform name length for alignment
  const maxLen = Math.max(...results.map(r => {
    return r.platform === 'domain' ? r.name.length : formatPlatform(r.platform).length;
  }));

  for (const result of results) {
    const platformName = result.platform === 'domain' ? result.name : formatPlatform(result.platform);
    const padding = ' '.repeat(maxLen - platformName.length + 2);
    const cached = result.cached ? colors.muted(' (cached)') : '';
    const error = result.error ? colors.muted(` ${result.error}`) : '';

    console.log(`  ${colors.label(platformName)}${padding}${formatStatus(result.status)}${cached}${error}`);
  }

  // Calculate score
  const available = results.filter(r => r.status === 'available').length;
  const total = results.filter(r => r.status !== 'error').length;
  const score = total > 0 ? Math.round((available / total) * 100) : 0;

  console.log();
  console.log(line);
  console.log();
  console.log(`  ${renderScoreBar(score)}  ${getScoreColor(score).bold(`${score}%`)} ${colors.muted('available')}`);
  console.log();
}

export function displaySuggestions(suggestions: SuggestionResult[]): void {
  const width = 52;
  const line = colors.border('─'.repeat(width));

  console.log();
  console.log(line);
  console.log(colors.header('  Suggestions'));
  console.log(line);
  console.log();

  for (const suggestion of suggestions) {
    const scoreColor = getScoreColor(suggestion.score);
    const bar = renderScoreBar(suggestion.score, 12);

    console.log(`  ${colors.label.bold(suggestion.name)}`);
    console.log(`  ${bar}  ${scoreColor(`${suggestion.score}%`)}`);
    console.log();

    for (const result of suggestion.results) {
      const icon = result.status === 'available'
        ? colors.available('●')
        : result.status === 'taken'
          ? colors.taken('○')
          : colors.error('⚠');

      const platform = result.platform === 'domain'
        ? colors.muted(result.name)
        : colors.muted(result.platform);

      console.log(`    ${icon} ${platform}`);
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
