import type { CliDefinition, KeyPair } from './index.d';
import cluster from 'cluster';
import { Command as Commander } from 'commander';
import { Queue } from './queue';
import { Command } from './command';

const { name, description, version } = require('./package.json');

export class Cli {
  queue: Queue;
  program: Commander;

  constructor(queue: Queue) {
    this.queue = queue;
    this.program = new Commander();
    this.program.name(name).description(description).version(version);
  }

  register(definition: CliDefinition) {
    if (!cluster.isPrimary) {
      return;
    }

    this.program
      .command(definition.command)
      .description(definition.description);

    const argKeys = Object.keys(definition.args);

    for (const arg of argKeys) {
      const description = definition.args[arg];

      this.program.argument(arg, description);
    }

    for (const option of Object.keys(definition.options)) {
      const description = definition.options[option];

      this.program.option(option, description);
    }

    Command.register(definition.command, definition.action);

    // program.action(definition.action);
    this.program.action((...args: string[] & [(KeyPair | string)?]) => {
      const options =
        typeof args[args.length - 1] === 'string'
          ? {}
          : (args[args.length - 1] as KeyPair);

      options.cli = {};

      let i = 0;
      for (const key of argKeys) {
        options.cli[key] = args[i];
        i += 1;
      }

      this.queue.add(
        new Command(definition.command, options, 'cli', 'primary')
      );
    });
  }

  start() {
    this.program.parse(process.argv);
  }
}
