type onCommandAction = (args: CommandArguments) => CommandArguments;
interface CommandArguments {
  [key: string]: any;
}

const commands: {
  [key: string]: onCommandAction;
} = {};

export class Command {
  command: string;
  args: CommandArguments;
  from: number;
  to: number | 'all';

  /**
   *
   */
  static register(command: string, onAction: onCommandAction) {
    commands[command] = onAction;
  }

  /**
   *
   */
  constructor(
    command: string,
    args: CommandArguments,
    from: number,
    to: number | 'all'
  ) {
    if (commands[command] === undefined) {
      throw new RangeError(`"${command}" has not been regsitered.`);
    }
    this.command = command;
    this.args = args;
    this.from = from;
    this.to = to;
  }

  /**
   *
   */
  run() {
    return commands[this.command](this.args);
  }
}
