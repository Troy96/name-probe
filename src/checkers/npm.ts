import { BaseChecker } from './base.js';
import type { CheckResult } from '../types.js';

export class NpmChecker extends BaseChecker {
  name = 'npm' as const;

  async check(name: string): Promise<CheckResult> {
    try {
      const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      // 404 means the package doesn't exist - name is available
      if (response.status === 404) {
        return this.createResult(name, 'available');
      }

      // 200 means the package exists - name is taken
      if (response.status === 200) {
        return this.createResult(name, 'taken');
      }

      return this.createResult(name, 'error', `Unexpected status: ${response.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createResult(name, 'error', message);
    }
  }
}
