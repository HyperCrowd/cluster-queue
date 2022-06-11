import type { CliDefinition, KeyPair } from './index.d';
import cluster from 'cluster';
import { Cli } from './cli';
import { Command } from './command';
import { Master } from './master';
import { Queue } from './queue';

/**
 * Starts the clusterQueue
 */
export async function startCluster(
  commands: CliDefinition[],
  onMasterStart: (master: Master) => Promise<void>,
  onMasterMessage: (
    worker: typeof cluster.worker,
    message: any
  ) => Promise<void>,
  onWorkerStart: (worker: typeof cluster.worker) => Promise<void>,
  onWorkerMessage: (message: any) => Promise<void>,
  useLogging: boolean = false
) {
  if (cluster.isPrimary) {
    const primaryQueue = new Queue(cluster);
    const workerQueue = new Queue(cluster);
    const cli = new Cli(primaryQueue, commands);
    const master = new Master(
      cluster,
      cli,
      primaryQueue,
      workerQueue,
      onMasterMessage,
      onWorkerMessage,
      useLogging
    );

    // Parse the CLI
    cli.start();

    // Wait for the primary queue to be empty

    await master.start();
    await onMasterStart(master);
  } else {
    const worker = cluster.worker;
    await onWorkerStart(worker);
  }
}

// @TODO: build a test bench

startCluster(
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
  // onMasterStart
  () => {},
  // onMasterMessage
  () => {},
  // onWorkerStart
  () => {},
  // onWorkerMessage
  () => {},
  true
);
