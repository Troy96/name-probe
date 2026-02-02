import { BaseChecker } from './base.js';
import type { CheckResult } from '../types.js';
import { getConfig } from '../utils/config.js';

export class GitHubChecker extends BaseChecker {
  name = 'github' as const;

  async check(name: string): Promise<CheckResult> {
    try {
      const config = getConfig();
      const headers: Record<string, string> = {
        'User-Agent': 'name-probe',
        'Accept': 'application/vnd.github+json',
      };

      if (config.githubToken) {
        headers['Authorization'] = `token ${config.githubToken}`;
      }

      // Check user/org and repos in parallel
      const [userExists, repoExists] = await Promise.all([
        this.checkUserOrOrg(name, headers),
        this.checkRepos(name, headers),
      ]);

      if (userExists || repoExists) {
        return this.createResult(name, 'taken');
      }

      return this.createResult(name, 'available');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createResult(name, 'error', message);
    }
  }

  private async checkUserOrOrg(name: string, headers: Record<string, string>): Promise<boolean> {
    try {
      const response = await fetch(`https://github.com/${name}`, {
        method: 'HEAD',
        headers,
        redirect: 'manual',
      });

      return response.status === 200 || response.status === 301 || response.status === 302;
    } catch {
      return false;
    }
  }

  private async checkRepos(name: string, headers: Record<string, string>): Promise<boolean> {
    try {
      // Search for repos with exact name match
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(name)}+in:name&per_page=10`,
        { headers }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json() as { items?: Array<{ name: string }> };

      // Check if any repo has an exact name match (case-insensitive)
      const lowerName = name.toLowerCase();
      return data.items?.some(repo => repo.name.toLowerCase() === lowerName) ?? false;
    } catch {
      return false;
    }
  }
}
