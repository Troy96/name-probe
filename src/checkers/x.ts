import { BaseChecker } from './base.js';
import type { CheckResult } from '../types.js';

export class XChecker extends BaseChecker {
  name = 'x' as const;

  async check(username: string): Promise<CheckResult> {
    try {
      // Use the old Twitter URL as it has better availability checking
      const response = await fetch(`https://x.com/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
      });

      // X returns 404 for non-existent profiles
      if (response.status === 404) {
        return this.createResult(username, 'available');
      }

      // 200 means profile exists (or it's a reserved/suspended account)
      if (response.status === 200) {
        const text = await response.text();

        // Check for "This account doesn't exist" message
        if (text.includes("This account doesn't exist") || text.includes('Account suspended')) {
          return this.createResult(username, 'available');
        }

        return this.createResult(username, 'taken');
      }

      // Rate limited
      if (response.status === 429) {
        return this.createResult(username, 'error', 'Rate limited');
      }

      return this.createResult(username, 'error', `Status: ${response.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createResult(username, 'error', message);
    }
  }
}
