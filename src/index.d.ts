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

export interface QuickSends {
  getNextJob: (command: string, args: KeyPair) => void;
  enqueueJob: (command: string, args: KeyPair) => void;
  newJobNotice: () => void;
  message: (command: string, args: KeyPair) => void;
}

export type CommandAction = (
  command: iCommand,
  state: KeyPair,
  sends: QuickSends
) => iCommand | void;

export interface CliDefinition {
  command: string;
  description?: string;
  args?: KeyPair;
  options?: KeyPair;
  action: CommandAction;
}
