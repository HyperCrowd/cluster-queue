interface KeyPair<T = any> {
  [key: string]: T;
}

interface iQueue {}

interface iCommand {
  command: string;
  args: KeyPair;
  from: number | 'primary' | 'cli';
  to: number | 'workers' | 'primary';
}

type CommandAction = (
  args: KeyPair,
  state: KeyPair,
  command: iCommand,
  primaryQueue: iQueue,
  workerQueue: iQueue
) => iCommand | void;

interface CliDefinition {
  command: string;
  description?: string;
  args?: KeyPair;
  options?: KeyPair;
  action: CommandAction;
}

export { CliDefinition, CommandAction, KeyPair, iCommand, iQueue };
