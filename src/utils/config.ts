import { config as loadEnv } from 'dotenv';

export interface Config {
  githubToken?: string;
  cacheTtlAvailable: number;
  cacheTtlTaken: number;
}

let configLoaded = false;
let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!configLoaded) {
    loadEnv();
    configLoaded = true;
  }

  cachedConfig = {
    githubToken: process.env.GITHUB_TOKEN,
    cacheTtlAvailable: parseInt(process.env.CACHE_TTL_AVAILABLE || '3600', 10),
    cacheTtlTaken: parseInt(process.env.CACHE_TTL_TAKEN || '86400', 10),
  };

  return cachedConfig;
}
