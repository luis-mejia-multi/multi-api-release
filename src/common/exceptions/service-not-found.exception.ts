export class ServiceNotFoundException extends Error {
  constructor(name: string) {
    super(`Service '${name}' not found or is inactive`);
    this.name = 'ServiceNotFoundException';
  }
}
