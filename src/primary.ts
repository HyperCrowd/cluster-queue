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

export class Primary {
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
    onPrimaryMessage: (
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
        // Primary should run its next command
        const command = this.primaryQueue.next();
        command.run(this.state, this.primaryQueue, this.workerQueue);
      } else {
        // All workers should be told a new command has appeared
        this.send(new Command('_pending', {}, 'primary', 'workers'));
      }
    });

    process.on('message', async (worker, command) => {
      // Primary receives message from worker
      console.log('primary.message');
      if (command.command === 'next') {
        const nextCommand = this.workerQueue.next(worker);
        await onPrimaryMessage(worker, nextCommand);
      } else {
        await onPrimaryMessage(worker, command);
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

  /**
   * Starts the priamry process
   */
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
      console.info('Primary cluster setting up ' + numWorkers + ' workers...');
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
  addTask(command: Command): Command {
    if (command.to === 'primary') {
      this.primaryQueue.add(command);
    } else {
      this.workerQueue.add(command);
    }

    return command;
  }

  /**
   *
   */
  workerCommand(command: string, args: KeyPair) {
    this.addTask(new Command(command, args, 'primary', 'workers'));
  }

  /**
   *
   */
  primaryCommand(command: string, args: KeyPair) {
    this.addTask(new Command(command, args, 'primary', 'primary'));
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
          console.info(`[PRIMARY -> PID ${worker.process.pid}]`, command);
        }

        worker.process.send(command);
      }
    }
  }
}
