export interface KeyPair<T = any> {
  [key: string]: T;
}

export interface iQueue {}

export type CommandFrom = number | 'primary' | 'cli' | 'pipe';

export type CommandTo =
  | number
  | 'workers'
  | 'primary'
  | '_getNextJob'
  | '_getNextJob_primary'
  | '_enqueueJob'
  | '_enqueueJob_primary'
  | '_newJobNotice'
  | 'message';

export interface iCommand {
  command: string;
  args: KeyPair;
  from: CommandFrom;
  to: CommandTo;
}

export interface QuickSends {
  getNextJob: () => void;
  enqueueJob: (command: string, args: KeyPair, to: CommandTo) => void;
  newJobNotice: () => void;
  message: (command: string, args: KeyPair) => void;
}

export type CommandAction = (
  command: iCommand,
  state: KeyPair,
  sends: QuickSends
) => Promise<iCommand | void>;

export interface CliDefinition {
  command: string;
  description?: string;
  args?: KeyPair;
  options?: KeyPair;
  action: CommandAction;
}
