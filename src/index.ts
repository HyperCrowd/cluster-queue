import type { CliDefinition, KeyPair } from './index.d';
import cluster from 'cluster';
import { Cli } from './cli';
import { Command } from './command';
import { Primary } from './primary';
import { Queue } from './queue';

export class Cluster {
  commands: CliDefinition[];
  useLogging: boolean;
  onPrimaryMessage: (
    worker: typeof cluster.worker,
    message: any
  ) => Promise<void>;
  onWorkerMessage: (message: any) => Promise<void>;

  constructor(commands: CliDefinition[], useLogging: boolean = false) {
    this.commands = commands;
    this.useLogging = useLogging;
    return this;
  }

  /**
   *
   */
  onMessage(
    onPrimaryMessage: (
      worker: typeof cluster.worker,
      message: any
    ) => Promise<void>,
    onWorkerMessage: (message: any) => Promise<void>
  ) {
    this.onPrimaryMessage = onPrimaryMessage;
    this.onWorkerMessage = onWorkerMessage;
    return this;
  }

  /**
   *
   */
  async start(
    onPrimaryStart: (primary: Primary) => Promise<void>,
    onWorkerStart: (worker: typeof cluster.worker) => Promise<void>
  ) {
    if (cluster.isPrimary) {
      const primaryQueue = new Queue(cluster);
      const workerQueue = new Queue(cluster);
      const cli = new Cli(primaryQueue, this.commands);
      const primary = new Primary(
        cluster,
        cli,
        primaryQueue,
        workerQueue,
        this.onPrimaryMessage,
        this.onWorkerMessage,
        this.useLogging
      );

      // Parse the CLI
      cli.start();

      // Wait for the primary queue to be empty

      await primary.start();
      await onPrimaryStart(primary);
    } else {
      await onWorkerStart(cluster.worker);
    }
  }
}

// @TODO: build a test bench

(async function main() {
  const instance = new Cluster(
    [
      {
        command: 'cli:test',
        description: 'Test',
        args: {
          '<test>': 'A fun test',
          '<pee>': 'no',
        },
        options: {},
        action: (args: KeyPair, state: KeyPair, command: Command) => {
          state[command.command] = command.args;
        },
      },
      {
        command: 'doThing',
        action: (command: Command) => {},
      },
    ],
    true
  ).onMessage(
    () => undefined,
    () => undefined
  );

  await instance.start(
    () => undefined,
    () => undefined
  );
})();
