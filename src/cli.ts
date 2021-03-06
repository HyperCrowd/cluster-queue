import type { CliDefinition, KeyPair } from './index.d';
import cluster from 'cluster';
import { Command as Commander } from 'commander';
import { Command } from './command';
import { internalCommands } from './commands';

const { name, description, version } = require('../package.json');

const removeChars = /[^A-Za-z0-9_]/g;

export class Cli {
  program: Commander;
  active: boolean = true;

  constructor(definitions: CliDefinition[], active: boolean = true) {
    this.active = active;
    if (this.active === false) {
      return;
    }

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
    if (this.active === false) {
      return;
    }

    if (!cluster.isPrimary) {
      return;
    }

    const commandName = definition.command.substring(4);

    // Register the definition as a command
    Command.register(definition.command, definition.action);

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

      cluster.emit(
        'message',
        new Command(
          definition.command,
          options,
          'cli',
          internalCommands.enqueueJobPrimary
        )
      );
    });
  }

  /**
   * Start the CLI
   */
  start() {
    if (this.active === false) {
      return;
    }

    this.program.parse(process.argv);
  }
}
