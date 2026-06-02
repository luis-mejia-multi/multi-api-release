export interface ICommand<TArgs = unknown, TOptions = unknown> {
  execute(args: TArgs, options: TOptions): Promise<void>;
}
