import chalk from 'chalk';
import type { CheckResult, SuggestionResult } from '../types.js';

const ICONS = {
  github: '󰊤 ',
  npm: ' ',
  pypi: '󰌠 ',
  domain: '󰖟 ',
  instagram: ' ',
  x: '𝕏 ',
};

function getIcon(platform: string): string {
  return ICONS[platform as keyof typeof ICONS] || '● ';
}

export function formatStatus(status: CheckResult['status']): string {
  switch (status) {
    case 'available':
      return chalk.green.bold('✓ Available');
    case 'taken':
      return chalk.red('✗ Taken');
    case 'error':
      return chalk.yellow('⚠ Error');
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
  return `${getIcon(platform)}${names[platform] || platform}`;
}

function renderScoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;

  const color = score >= 75 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
  const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));

  return bar;
}

function boxTop(width: number): string {
  return chalk.dim('╭' + '─'.repeat(width - 2) + '╮');
}

function boxBottom(width: number): string {
  return chalk.dim('╰' + '─'.repeat(width - 2) + '╯');
}

function boxLine(content: string, width: number): string {
  const visibleLength = content.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = width - 4 - visibleLength;
  return chalk.dim('│') + ' ' + content + ' '.repeat(Math.max(0, padding)) + ' ' + chalk.dim('│');
}

function boxDivider(width: number): string {
  return chalk.dim('├' + '─'.repeat(width - 2) + '┤');
}

export function displayResults(name: string, results: CheckResult[]): void {
  const boxWidth = 50;

  console.log();
  console.log(boxTop(boxWidth));
  console.log(boxLine(chalk.bold.cyan(`🔍 Checking: ${name}`), boxWidth));
  console.log(boxDivider(boxWidth));

  for (const result of results) {
    const platform = result.platform === 'domain'
      ? `${getIcon('domain')}${result.name}`
      : formatPlatform(result.platform);

    const status = formatStatus(result.status);
    const cached = result.cached ? chalk.dim(' (cached)') : '';
    const error = result.error ? chalk.dim(` ${result.error}`) : '';

    console.log(boxLine(`${platform}  ${status}${cached}${error}`, boxWidth));
  }

  // Calculate score
  const available = results.filter(r => r.status === 'available').length;
  const total = results.filter(r => r.status !== 'error').length;
  const score = total > 0 ? Math.round((available / total) * 100) : 0;

  console.log(boxDivider(boxWidth));

  const scoreColor = score >= 75 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
  const scoreText = `Score: ${renderScoreBar(score)} ${scoreColor.bold(`${score}%`)}`;
  console.log(boxLine(scoreText, boxWidth));

  console.log(boxBottom(boxWidth));
  console.log();
}

export function displaySuggestions(suggestions: SuggestionResult[]): void {
  console.log();
  console.log(chalk.bold.cyan('💡 Suggestions') + chalk.dim(' (sorted by availability)'));
  console.log();

  for (const suggestion of suggestions) {
    const scoreColor = suggestion.score >= 75
      ? chalk.green
      : suggestion.score >= 50
        ? chalk.yellow
        : chalk.red;

    const bar = renderScoreBar(suggestion.score, 10);
    console.log(`  ${chalk.bold(suggestion.name)} ${bar} ${scoreColor(`${suggestion.score}%`)}`);

    for (const result of suggestion.results) {
      const icon = result.status === 'available'
        ? chalk.green('✓')
        : result.status === 'taken'
          ? chalk.red('✗')
          : chalk.yellow('⚠');

      const platform = result.platform === 'domain'
        ? chalk.dim(result.name)
        : chalk.dim(result.platform);

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
