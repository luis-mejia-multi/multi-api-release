import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { IGithubService } from './interfaces/github.interface';
import { GithubApiException } from '../common/exceptions/github-api.exception';

@Injectable()
export class GithubService implements IGithubService, OnModuleInit {
  private octokit!: Octokit;
  private org!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const token = this.config.get<string>('app.github.token');
    this.org = this.config.get<string>('app.github.org') ?? 'multi-develop';
    this.octokit = new Octokit({ auth: token });
  }

  async getBranchSha(repo: string, branch: string): Promise<string> {
    try {
      const { data } = await this.octokit.git.getRef({
        owner: this.org,
        repo,
        ref: `heads/${branch}`,
      });
      return data.object.sha;
    } catch (err: unknown) {
      const e = err as { message: string; status?: number };
      throw new GithubApiException(
        `Failed to get SHA for ${repo}@${branch}: ${e.message}`,
        e.status,
      );
    }
  }

  async createTag(repo: string, tagName: string, sha: string): Promise<void> {
    try {
      await this.octokit.git.createRef({
        owner: this.org,
        repo,
        ref: `refs/tags/${tagName}`,
        sha,
      });
    } catch (err: unknown) {
      const e = err as { message: string; status?: number };
      throw new GithubApiException(
        `Failed to create tag ${tagName} in ${repo}: ${e.message}`,
        e.status,
      );
    }
  }
}
