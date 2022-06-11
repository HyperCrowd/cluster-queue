export interface KeyPair<T = any> {
  [key: string]: T;
}

export interface iCommand {
  command: string;
  args: KeyPair;
  from: number | 'primary' | 'cli';
  to: number | 'workers' | 'primary';
}

export type CommandAction = (args: KeyPair) => iCommand | void;

export interface CliDefinition {
  command: string;
  description?: string;
  args?: KeyPair;
  options?: KeyPair;
  action: CommandAction;
}
