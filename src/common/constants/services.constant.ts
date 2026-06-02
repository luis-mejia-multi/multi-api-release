export const GITHUB_ORG = process.env.GH_ORG ?? 'multi-develop';
export const DEFAULT_BRANCH = 'master';
export const REPO_LIST_PATH =
  process.env.REPO_LIST_PATH ??
  require('path').resolve(__dirname, '../../../../multi-service-k8s/knowledge-base/repository-list.txt');
