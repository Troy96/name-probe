import dns from 'node:dns';
import { promisify } from 'node:util';
import { BaseChecker } from './base.js';
import type { CheckResult, Platform } from '../types.js';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

export class DomainChecker extends BaseChecker {
  name = 'domain' as const;
  private tld: string;

  constructor(tld: string = 'com') {
    super();
    this.tld = tld;
  }

  async check(name: string): Promise<CheckResult> {
    const domain = `${name}.${this.tld}`;

    try {
      // Try to resolve A records first
      try {
        await resolve4(domain);
        return this.createResult(name, 'taken');
      } catch {
        // No A records, try AAAA
      }

      // Try to resolve AAAA records
      try {
        await resolve6(domain);
        return this.createResult(name, 'taken');
      } catch {
        // No AAAA records either
      }

      // No DNS records found - domain might be available
      // Note: This doesn't mean the domain is actually available for registration,
      // just that it doesn't have DNS records
      return this.createResult(name, 'available');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createResult(name, 'error', message);
    }
  }

  // Override to include TLD in platform name for display
  protected createResult(
    name: string,
    status: CheckResult['status'],
    error?: string
  ): CheckResult {
    return {
      platform: `domain` as Platform,
      name: `${name}.${this.tld}`,
      status,
      ...(error && { error }),
    };
  }
}
