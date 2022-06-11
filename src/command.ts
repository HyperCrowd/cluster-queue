import type { CommandAction, iCommand, KeyPair } from './index.d';

const commands: KeyPair<CommandAction> = {};

export class Command implements iCommand {
  command: string;
  args: KeyPair;
  from: number | 'primary' | 'cli';
  to: number | 'workers' | 'primary';

  /**
   *
   */
  static register(command: string, onAction: CommandAction) {
    commands[command] = onAction;
  }

  /**
   *
   */
  constructor(
    command: string,
    args: KeyPair,
    from: number | 'primary' | 'cli',
    to: number | 'workers' | 'primary'
  ) {
    if (commands[command] === undefined) {
      throw new RangeError(`"${command}" has not been registered.`);
    }

    this.command = command;
    this.args = args;
    this.from = from;
    this.to = to;
  }

  /**
   *
   */
  clone(from: number | 'primary', to: number | 'workers' | 'primary') {
    return new Command(this.command, this.args, from, to);
  }

  /**
   *
   */
  run() {
    return commands[this.command](this.args);
  }
}
