import type { KeyPair } from './index.d';
type Process = typeof cluster;

import cluster from 'cluster';
import * as os from 'os';
import { Cli } from './cli';
import { Command } from './command';
import { Queue } from './queue';
import { Worker } from './worker';

const cpus = os.cpus();
const numWorkers = cpus.length;

export class Master {
  process: Process;
  workers: Worker[] = [];
  primaryQueue: Queue;
  workerQueue: Queue;
  useLogging: boolean;
  cli: Cli;
  state: KeyPair = {};

  constructor(
    process: Process,
    cli: Cli,
    primaryQueue: Queue,
    workerQueue: Queue,
    onMessage: (
      worker: typeof cluster.worker,
      command: Command
    ) => Promise<void>,
    onWorkerMessage: (message: any) => Promise<void>,
    useLogging: boolean = false
  ) {
    this.cli = cli;
    this.process = process;
    this.useLogging = useLogging;
    this.primaryQueue = primaryQueue;
    this.workerQueue = workerQueue;

    process.on('newCommand', (to: string) => {
      // New command enqueued
      if (to === 'primary') {
        const command = this.primaryQueue.next();
        command.run(this.state, this.primaryQueue, this.workerQueue);
      }
    });

    process.on('message', async (worker, command) => {
      // Primary receives message from worker
      if (command.command === '_next') {
        const nextCommand = this.workerQueue.next(worker);
        await onMessage(worker, nextCommand);
      } else {
        await onMessage(worker, command);
      }
    });

    process.on('exit', (worker, code, signal) => {
      // When a worker quits
      if (this.useLogging) {
        console.info(
          'Worker ' +
            worker.process.pid +
            ' died with code: ' +
            code +
            ', and signal: ' +
            signal
        );
      }

      this.spawnWorker();
    });

    process.on('online', (worker) => {
      // When a worker spawns
      if (this.useLogging) {
        console.info('Worker ' + worker.process.pid + ' is online');
      }

      const newWorker = new Worker(worker, onWorkerMessage);
      this.workers.push(newWorker);
    });
  }

  async start() {
    await Promise.all([
      new Promise((resolve) => {
        setTimeout(() => {
          if (this.primaryQueue.queue.length === 0) {
            resolve(true);
          }
        }, 100);
      }),
    ]);

    if (this.useLogging) {
      console.info('Master cluster setting up ' + numWorkers + ' workers...');
    }

    for (var i = 0; i < numWorkers; i++) {
      this.spawnWorker();
    }
  }

  /**
   * Spawn a new worker that self-cleans up
   */
  spawnWorker() {
    let worker = this.process.fork();

    worker.on('disconnect', () => {
      worker.removeAllListeners();
      worker.kill();
      worker = undefined;
    });

    return worker;
  }

  /**
   * Adds a command for later processing
   */
  async addTask(command: Command): Promise<Command> {
    if (command.to === 'primary') {
      this.primaryQueue.add(command);
    } else {
      this.workerQueue.add(command);
    }

    return command;
  }

  /**
   * Get worker processes
   */
  getWorkerProcesses() {
    return Object.values(cluster.workers);
  }

  /**
   * Restart all Worker instances
   */
  restartWorkers() {
    for (const worker of this.workers) {
      worker.restart();
    }
  }

  /**
   * Send a message to workers
   */
  send(command: Command) {
    const workers = this.getWorkerProcesses();

    for (const worker of workers) {
      if (
        command.to === 'workers' ||
        (worker.process !== undefined && worker.process.pid === command.to)
      ) {
        if (this.useLogging) {
          console.info(`[MASTER -> PID ${worker.process.pid}]`, command);
        }

        worker.process.send(command);
      }
    }
  }
}
