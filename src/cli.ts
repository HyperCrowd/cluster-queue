import type { CliDefinition, KeyPair } from './index.d';
import cluster from 'cluster';
import { Command as Commander } from 'commander';
import { Queue } from './queue';
import { Command } from './command';

const { name, description, version } = require('../package.json');

const removeChars = /[^A-Za-z0-9_]/g;

export class Cli {
  queue: Queue;
  program: Commander;

  constructor(queue: Queue, definitions: CliDefinition[]) {
    this.queue = queue;
    this.program = new Commander();
    this.program.name(name).description(description).version(version);

    for (const definition of definitions) {
      this.register(definition);
    }
  }

  /**
   * Registers a new CLI command
   */
  register(definition: CliDefinition) {
    if (!cluster.isPrimary) {
      return;
    }

    const isCliCommand = definition.command.indexOf('cli:') === 0;

    const commandName = isCliCommand
      ? definition.command.substring(4)
      : definition.command;

    // Register the definition as a command
    Command.register(definition.command, definition.action);

    if (!isCliCommand) {
      return;
    }

    // Register the command
    const newCommand =
      commandName === '' ? this.program : this.program.command(commandName);

    newCommand.description(definition.description);

    // Define the end-of-line arguments
    const argKeys = Object.keys(definition.args);

    for (const arg of argKeys) {
      const description = definition.args[arg];

      newCommand.argument(arg, description);
    }

    // Define the flags/options
    for (const option of Object.keys(definition.options)) {
      const description = definition.options[option];

      newCommand.option(option, description);
    }

    // program.action(definition.action);
    newCommand.action((...args: string[] & [(KeyPair | string)?]) => {
      const options =
        typeof args[args.length - 2] === 'string'
          ? {}
          : (args[args.length - 2] as KeyPair);

      options.cli = {};

      let i = 0;
      for (const key of argKeys) {
        options.cli[key.replace(removeChars, '')] = args[i];
        i += 1;
      }

      this.queue.add(
        new Command(definition.command, options, 'cli', 'primary')
      );
    });
  }

  /**
   * Start the CLI
   */
  start() {
    this.program.parse(process.argv);
  }
}
