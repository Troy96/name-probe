import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { CacheEntry, CheckResult } from '../types.js';
import { getConfig } from './config.js';

const CACHE_DIR = path.join(os.homedir(), '.nameprobe', 'cache');

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCacheKey(platform: string, name: string): string {
  // Create a safe filename from platform and name
  const safeName = Buffer.from(`${platform}:${name}`).toString('base64url');
  return path.join(CACHE_DIR, `${safeName}.json`);
}

export function getCached(platform: string, name: string): CheckResult | null {
  try {
    const cacheFile = getCacheKey(platform, name);

    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    const data = fs.readFileSync(cacheFile, 'utf-8');
    const entry: CacheEntry = JSON.parse(data);

    // Check if cache is expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      // Cache expired, delete the file
      fs.unlinkSync(cacheFile);
      return null;
    }

    return { ...entry.result, cached: true };
  } catch {
    return null;
  }
}

export function setCache(result: CheckResult): void {
  try {
    ensureCacheDir();

    const config = getConfig();
    const ttl = result.status === 'available'
      ? config.cacheTtlAvailable
      : config.cacheTtlTaken;

    // Don't cache errors
    if (result.status === 'error') {
      return;
    }

    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      ttl,
    };

    const cacheFile = getCacheKey(result.platform, result.name);
    fs.writeFileSync(cacheFile, JSON.stringify(entry, null, 2));
  } catch {
    // Silently fail on cache write errors
  }
}

export function clearCache(): void {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    }
  } catch {
    // Silently fail on cache clear errors
  }
}
