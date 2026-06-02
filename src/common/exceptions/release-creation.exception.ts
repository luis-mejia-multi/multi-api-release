export class ReleaseCreationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReleaseCreationException';
  }
}
