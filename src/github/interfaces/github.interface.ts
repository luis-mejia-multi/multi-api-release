export interface IGithubService {
  getBranchSha(repo: string, branch: string): Promise<string>;
  createTag(repo: string, tagName: string, sha: string): Promise<void>;
}

export interface TagResult {
  repo: string;
  tagName: string;
  sha: string;
  success: boolean;
  error?: string;
}
