import type { KeyPair } from './index.d';
type Process = typeof cluster;

import cluster from 'cluster';
import * as os from 'os';
import { Cli } from './cli';
import { Command } from './command';
import { Queue } from './queue';
import { Worker } from './worker';
import { internalCommands } from './commands';

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
    onPrimaryMessage: (
      worker: typeof cluster.worker,
      command: Command
    ) => Promise<Command | void>,
    onWorkerMessage: (message: any) => Promise<void>,
    useLogging: boolean = false
  ) {
    this.cli = cli;
    this.process = process;
    this.useLogging = useLogging;
    this.primaryQueue = new Queue();
    this.workerQueue = new Queue();

    /**
     * Enqueue new command
     */
    process.on(internalCommands.enqueue, async (command: Command) => {
      if (command.to === 'primary') {
        // Primary should run its next command
        await command.run(this.state, this.primaryQueue, this.workerQueue);
      } else {
        // All workers should be told a new command has appeared
        this.addTask(command);
        this.send(new Command(internalCommands.new, {}, 'primary', 'workers'));
      }
    });

    /**
     * Primary receives message from worker
     */
    process.on('message', async (worker, command) => {
      console.log('primary.message');
      if (command.command === 'next') {
        const nextCommand = this.workerQueue.getNext(worker.process.pid);
        if (nextCommand === undefined) {
          return;
        }

        const finalCommand = await onPrimaryMessage(worker, nextCommand);

        if (finalCommand) {
          worker.send(finalCommand);
        } else {
          worker.send(nextCommand);
        }
      } else {
        await onPrimaryMessage(worker, command);
      }
    });

    /**
     * When a worker quits
     */
    process.on('exit', (worker, code, signal) => {
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

    /**
     * When a worker spawns
     */
    process.on('online', (worker) => {
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
