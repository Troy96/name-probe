#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { checkCommand, parsePlatforms, parseDomains } from './commands/check.js';
import { suggestCommand } from './commands/suggest.js';

function showIntro(): void {
  const line = chalk.gray('─'.repeat(52));
  const accent = chalk.hex('#10B981');

  console.log();
  console.log(line);
  console.log(chalk.white.bold('  name-probe'));
  console.log(chalk.dim('  Check name availability across platforms'));
  console.log(line);
  console.log();
  console.log(chalk.white.bold('  Usage'));
  console.log();
  console.log(`    ${accent('name-probe')} ${chalk.dim('<name>')}              Check availability`);
  console.log(`    ${accent('name-probe suggest')} ${chalk.dim('<name>')}      Get suggestions`);
  console.log();
  console.log(chalk.white.bold('  Examples'));
  console.log();
  console.log(chalk.dim('    $ ') + chalk.white('name-probe myproject'));
  console.log(chalk.dim('    $ ') + chalk.white('name-probe myproject --platforms github,npm'));
  console.log(chalk.dim('    $ ') + chalk.white('name-probe myproject --domains com,io,dev'));
  console.log(chalk.dim('    $ ') + chalk.white('name-probe suggest myapp --count 5'));
  console.log();
  console.log(chalk.white.bold('  Options'));
  console.log();
  console.log(`    ${chalk.white('-p, --platforms')} ${chalk.dim('<list>')}    github,npm,pypi,instagram,x,domain`);
  console.log(`    ${chalk.white('-d, --domains')} ${chalk.dim('<list>')}      TLDs to check (default: com)`);
  console.log(`    ${chalk.white('--no-cache')}                Bypass cache`);
  console.log(`    ${chalk.white('--json')}                    Output as JSON`);
  console.log();
  console.log(line);
  console.log();
}

const program = new Command();

program
  .name('name-probe')
  .description('CLI tool for checking name availability across platforms')
  .version('1.0.0')
  .argument('[name]', 'The name to check')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (github,npm,pypi,instagram,x,domain)', parsePlatforms)
  .option('-d, --domains <domains>', 'Comma-separated list of domain TLDs to check (default: com)', parseDomains)
  .option('--no-cache', 'Bypass the cache')
  .option('--json', 'Output results as JSON')
  .allowUnknownOption(false)
  .action(async (name: string | undefined, options) => {
    // No name provided - show intro
    if (!name) {
      showIntro();
      return;
    }

    // "suggest" is handled by subcommand
    if (name === 'suggest') {
      return;
    }

    // Everything else is a search
    await checkCommand(name, {
      platforms: options.platforms,
      domains: options.domains,
      noCache: !options.cache,
      json: options.json,
    });
  });

program
  .command('suggest')
  .description('Generate and check name variations')
  .argument('<name>', 'The base name to generate suggestions from')
  .option('-c, --count <count>', 'Number of suggestions to show', (v) => parseInt(v, 10), 10)
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (github,npm,pypi,instagram,x,domain)', parsePlatforms)
  .option('-d, --domains <domains>', 'Comma-separated list of domain TLDs to check (default: com)', parseDomains)
  .option('--no-cache', 'Bypass the cache')
  .option('--json', 'Output results as JSON')
  .action(async (name: string, options) => {
    await suggestCommand(name, {
      count: options.count,
      platforms: options.platforms,
      domains: options.domains,
      noCache: !options.cache,
      json: options.json,
    });
  });

program.parse();
