export class GithubApiException extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'GithubApiException';
  }
}
