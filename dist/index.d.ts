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

interface QuickSends {
  getNextJob: () => void;
  enqueueJob: (command: string, args: KeyPair, to: CommandTo) => void;
  newJobNotice: () => void;
  message: (command: string, args: KeyPair) => void;
}

type CommandAction = (
  command: iCommand,
  state: KeyPair,
  sends: QuickSends
) => iCommand | void;

interface CliDefinition {
  command: string;
  description?: string;
  args?: KeyPair;
  options?: KeyPair;
  action: CommandAction;
}

export { CliDefinition, CommandAction, CommandFrom, CommandTo, KeyPair, QuickSends, iCommand, iQueue };
