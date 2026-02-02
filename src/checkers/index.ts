import type { Checker } from './base.js';
import type { Platform } from '../types.js';
import { GitHubChecker } from './github.js';
import { NpmChecker } from './npm.js';
import { PyPIChecker } from './pypi.js';
import { DomainChecker } from './domain.js';

export { GitHubChecker, NpmChecker, PyPIChecker, DomainChecker };
export type { Checker };

export interface CheckerRegistry {
  getChecker(platform: Platform): Checker | undefined;
  getCheckers(platforms?: Platform[], domains?: string[]): Checker[];
  getAllPlatforms(): Platform[];
}

class Registry implements CheckerRegistry {
  private checkers: Map<Platform, Checker> = new Map();
  private defaultDomains = ['com'];

  constructor() {
    this.register(new GitHubChecker());
    this.register(new NpmChecker());
    this.register(new PyPIChecker());
  }

  private register(checker: Checker): void {
    this.checkers.set(checker.name, checker);
  }

  getChecker(platform: Platform): Checker | undefined {
    return this.checkers.get(platform);
  }

  getCheckers(platforms?: Platform[], domains?: string[]): Checker[] {
    const result: Checker[] = [];
    const targetPlatforms = platforms || this.getAllPlatforms();
    const targetDomains = domains || this.defaultDomains;

    for (const platform of targetPlatforms) {
      if (platform === 'domain') {
        // Add a domain checker for each TLD
        for (const tld of targetDomains) {
          result.push(new DomainChecker(tld));
        }
      } else {
        const checker = this.checkers.get(platform);
        if (checker) {
          result.push(checker);
        }
      }
    }

    return result;
  }

  getAllPlatforms(): Platform[] {
    return ['github', 'npm', 'pypi', 'domain'];
  }
}

export const registry = new Registry();
