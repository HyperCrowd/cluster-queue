import type { CliDefinition } from './index.d';
import cluster from 'cluster';
import { Cli } from './cli';
import { Command } from './command';
import { Master } from './master';
import { Queue } from './queue';

export function startCluster(
  commands: CliDefinition[],
  onMasterStart: (master: Master) => void,
  onMasterMessage: (worker: typeof cluster.worker, message: any) => void,
  onWorkerStart: (worker: typeof cluster.worker) => void,
  onWorkerMessage: (message: any) => void,
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
    onMasterStart(master);
    cli.start();
  } else {
    const worker = cluster.worker;
    onWorkerStart(worker);
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
      action: (command: Command) => {
        console.log(command);
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
