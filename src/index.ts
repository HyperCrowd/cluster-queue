import type {
  CliDefinition,
  CommandAction,
  KeyPair,
  QuickSends,
} from './index.d';
import cluster from 'cluster';
import { Cli } from './cli';
import { Primary } from './primary';
import { defaultCommands } from './commands';
import { Command } from './command';
import { Worker } from './worker';

const noop = () => undefined;

export class Cluster {
  cliCommands: CliDefinition[] = [];
  useLogging: boolean;
  onPrimaryCommand: CommandAction = noop;
  onWorkerCommand: CommandAction = noop;

  constructor(commands: CliDefinition[] = [], useLogging: boolean = false) {
    this.useLogging = useLogging;

    // Default actions
    for (const defaultCommand of defaultCommands.concat(commands)) {
      if (defaultCommand.command.indexOf('cli:') === 0) {
        // Register CLI commands
        this.cliCommands.push(defaultCommand);
      } else {
        // Register actions
        Command.register(defaultCommand.command, defaultCommand.action);
      }
    }

    return this;
  }

  /**
   * Cluster node command handlers
   */
  onCommand(onPrimaryCommand: CommandAction, onWorkerCommand: CommandAction) {
    this.onPrimaryCommand = onPrimaryCommand;
    this.onWorkerCommand = onWorkerCommand;
    return this;
  }

  /**
   * Start the cluster nodes
   */
  async start(
    onPrimaryStart: (primary: Primary) => Promise<void> = noop,
    onWorkerStart: (worker: Worker) => Promise<void> = noop
  ) {
    if (cluster.isPrimary) {
      const cli = new Cli(this.cliCommands);
      const primary = new Primary(
        cluster,
        cli,
        this.onPrimaryCommand,
        this.useLogging
      );

      // Parse the CLI
      cli.start();

      // Wait for the primary queue to be empty
      await primary.start();
      await onPrimaryStart(primary);
    } else {
      await onWorkerStart(
        new Worker(cluster.worker, this.onWorkerCommand, this.useLogging)
      );
    }
  }
}

// @TODO: build a test bench

(async function main() {
  const instance = new Cluster(
    [
      {
        command: 'cli:setText',
        description: 'Sets text in the primary process',
        args: {
          '<text>': 'The name of the state to set',
        },
        options: {
          '-f': 'First character only',
        },
        action: async (command: Command, state: KeyPair, sends: QuickSends) => {
          state.text =
            command.args.f === true
              ? command.args.cli.text[0]
              : command.args.cli.text;

          console.log('setText', state);
        },
      },
      {
        command: 'iterate',
        action: async (command: Command, state: KeyPair, sends: QuickSends) => {
          if (state.value === undefined) {
            state.value = 0;
          }

          state.value += 1;
          console.log('Iterated value:', state.value);
        },
      },
    ],
    true
  ).onCommand(
    async (command: Command, state: KeyPair, sends: QuickSends) => {
      console.info(`Primary Message: ${command.command}`);
    },
    async (command: Command, state: KeyPair, sends: QuickSends) => {
      console.info(`Worker Message: ${command.command}`);
      sends.enqueueJob(
        'iterateState',
        {
          commands: 1,
        },
        'primary'
      );
    }
  );

  await instance.start(
    async (primary: Primary) => {
      console.info(`Primary ready`);
      primary.sends.enqueueJob('iterate');
    },
    async (worker: Worker) => {
      console.info(`Worker ${worker.pid} ready`);
    }
  );
})();
