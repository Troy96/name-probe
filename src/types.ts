export type Platform = 'github' | 'npm' | 'pypi' | 'domain' | 'instagram' | 'x';

export type AvailabilityStatus = 'available' | 'taken' | 'error';

export interface CheckResult {
  platform: Platform;
  name: string;
  status: AvailabilityStatus;
  error?: string;
  cached?: boolean;
}

export interface SuggestionResult {
  name: string;
  results: CheckResult[];
  score: number; // 0-100, percentage of platforms where available
}

export interface CacheEntry {
  result: CheckResult;
  timestamp: number;
  ttl: number;
}

export interface CheckOptions {
  platforms?: Platform[];
  domains?: string[];
  noCache?: boolean;
  json?: boolean;
}

export interface SuggestOptions {
  count?: number;
  platforms?: Platform[];
  domains?: string[];
  noCache?: boolean;
  json?: boolean;
}
