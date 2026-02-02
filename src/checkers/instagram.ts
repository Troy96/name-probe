import { BaseChecker } from './base.js';
import type { CheckResult } from '../types.js';

export class InstagramChecker extends BaseChecker {
  name = 'instagram' as const;

  async check(username: string): Promise<CheckResult> {
    try {
      const response = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
      });

      // Instagram returns 404 for non-existent profiles
      if (response.status === 404) {
        return this.createResult(username, 'available');
      }

      // 200 means profile exists
      if (response.status === 200) {
        // Check if it's actually a profile page or a redirect to login
        const text = await response.text();
        if (text.includes('"username"') || text.includes(`@${username}`)) {
          return this.createResult(username, 'taken');
        }
        // If we can't determine, assume taken to be safe
        return this.createResult(username, 'taken');
      }

      // Rate limited or blocked
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
