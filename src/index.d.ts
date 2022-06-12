export interface KeyPair<T = any> {
  [key: string]: T;
}

export interface iQueue {}

export type CommandFrom = number | 'primary' | 'cli' | 'pipe';

export type CommandTo = number | 'workers' | 'primary';

export interface iCommand {
  command: string;
  args: KeyPair;
  from: CommandFrom;
  to: CommandTo;
}

export type CommandAction = (
  args: KeyPair,
  state: KeyPair,
  command: iCommand,
  primaryQueue: iQueue,
  workerQueue: iQueue
) => iCommand | void;

export interface CliDefinition {
  command: string;
  description?: string;
  args?: KeyPair;
  options?: KeyPair;
  action: CommandAction;
}
