#!/usr/bin/env node

import { Command } from 'commander';
import { checkCommand, parsePlatforms, parseDomains } from './commands/check.js';
import { suggestCommand } from './commands/suggest.js';

const program = new Command();

program
  .name('name-probe')
  .description('CLI tool for checking name availability across platforms')
  .version('1.0.0')
  .argument('[name]', 'The name to check')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (github,npm,pypi,domain)', parsePlatforms)
  .option('-d, --domains <domains>', 'Comma-separated list of domain TLDs to check (default: com)', parseDomains)
  .option('--no-cache', 'Bypass the cache')
  .option('--json', 'Output results as JSON')
  .action(async (name: string | undefined, options) => {
    if (name && !['suggest', 'help'].includes(name)) {
      await checkCommand(name, {
        platforms: options.platforms,
        domains: options.domains,
        noCache: !options.cache,
        json: options.json,
      });
    }
  });

program
  .command('suggest')
  .description('Generate and check name variations')
  .argument('<name>', 'The base name to generate suggestions from')
  .option('-c, --count <count>', 'Number of suggestions to show', (v) => parseInt(v, 10), 10)
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (github,npm,pypi,domain)', parsePlatforms)
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
