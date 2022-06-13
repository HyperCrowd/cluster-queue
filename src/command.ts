import type {
  CommandAction,
  CommandFrom,
  CommandTo,
  iCommand,
  KeyPair,
  QuickSends,
} from './index.d';

const commands: KeyPair<CommandAction> = {};

export class Command implements iCommand {
  command: string;
  args: KeyPair;
  from: CommandFrom;
  to: CommandTo;

  /**
   * Registers a new command
   */
  static register(command: string, onAction: CommandAction) {
    commands[command] = onAction;
  }

  /**
   * Constructor
   */
  constructor(
    command: string,
    args: KeyPair,
    from: CommandFrom,
    to: CommandTo
  ) {
    if (commands[command] === undefined && command[0] !== '_') {
      throw new RangeError(`"${command}" has not been registered.`);
    }

    this.command = command;
    this.args = args;
    this.from = from;
    this.to = to;
  }

  /**
   * Clones a command and changes the to and from properties
   */
  clone(from: CommandFrom, to: CommandTo) {
    return new Command(this.command, this.args, from, to);
  }

  /**
   * Runs the command
   */
  async run(state: KeyPair, quickSends: QuickSends) {
    return commands[this.command](this, state, quickSends);
  }
}
