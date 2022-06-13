import type { CliDefinition, KeyPair, QuickSends } from './index.d';
import cluster from 'cluster';
import { Cli } from './cli';
import { Primary } from './primary';
import { defaultCommands } from './commands';
import { Command } from './command';
import { Worker } from './worker';

export class Cluster {
  commands: CliDefinition[];
  useLogging: boolean;
  onPrimaryCommand: (
    worker: typeof cluster.worker,
    command: Command
  ) => Promise<void>;
  onWorkerCommand: (command: Command) => Promise<void>;

  constructor(commands: CliDefinition[], useLogging: boolean = false) {
    this.commands = commands;
    this.useLogging = useLogging;

    // Default actions
    for (const defaultCommand of defaultCommands) {
      this.commands.push(defaultCommand);
    }

    return this;
  }

  /**
   * Cluster node command handlers
   */
  onCommand(
    onPrimaryCommand: (
      worker: typeof cluster.worker,
      command: Command
    ) => Promise<void>,
    onWorkerCommand: (command: Command) => Promise<void>
  ) {
    this.onPrimaryCommand = onPrimaryCommand;
    this.onWorkerCommand = onWorkerCommand;
    return this;
  }

  /**
   * Start the cluster nodes
   */
  async start(
    onPrimaryStart: (primary: Primary) => Promise<void>,
    onWorkerStart: (worker: Worker) => Promise<void>
  ) {
    if (cluster.isPrimary) {
      const cli = new Cli(this.commands);
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
        command: 'cli:setState',
        description: 'Sets a state in the primary process',
        args: {
          '<text>': 'The name of the state to set',
        },
        options: {},
        action: (command: Command, state: KeyPair, sends: QuickSends) => {
          state.text = command.args.cli.text;
          console.log('setState', state);
        },
      },
    ],
    true
  ).onCommand(
    async (worker: typeof cluster.worker, command: Command) => {
      console.log('PRIMARY COMMAND', command);
    },
    async (command: Command) => {
      console.log('WORKER COMMAND', command);
    }
  );

  await instance.start(
    async (primary: Primary) => {
      console.log('PRIMARY START');
    },
    async (worker: Worker) => {
      console.log('WORKER START');
    }
  );
})();
