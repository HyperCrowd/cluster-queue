interface KeyPair<T = any> {
  [key: string]: T;
}

interface iQueue {}

type CommandFrom = number | 'primary' | 'cli' | 'pipe';

type CommandTo = number | 'workers' | 'primary';

interface iCommand {
  command: string;
  args: KeyPair;
  from: CommandFrom;
  to: CommandTo;
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

export { CliDefinition, CommandAction, CommandFrom, CommandTo, KeyPair, iCommand, iQueue };
