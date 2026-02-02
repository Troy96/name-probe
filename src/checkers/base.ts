import type { CheckResult, Platform } from '../types.js';

export interface Checker {
  name: Platform;
  check(name: string): Promise<CheckResult>;
}

export abstract class BaseChecker implements Checker {
  abstract name: Platform;
  abstract check(name: string): Promise<CheckResult>;

  protected createResult(
    name: string,
    status: CheckResult['status'],
    error?: string
  ): CheckResult {
    return {
      platform: this.name,
      name,
      status,
      ...(error && { error }),
    };
  }
}
