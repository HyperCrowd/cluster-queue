type onCommandAction = (args: CommandArguments) => CommandArguments;
interface CommandArguments {
  [key: string]: any;
}

const commands: {
  [key: string]: onCommandAction;
} = {};

export class Command {
  from: number;
  to: number | 'all';
  command: string;
  args: CommandArguments;

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
    from: number,
    to: number | 'all',
    command: string,
    args: CommandArguments
  ) {
    this.from = from;
    this.to = to;
    this.command = command;
    this.args = args;
  }
}
