import type { KeyPair, QuickSends } from './index.d';

import cluster from 'cluster';
import * as os from 'os';
import { Cli } from './cli';
import { Command } from './command';
import { Queue } from './queue';
import { internalCommands } from './commands';
import { CommandTo } from '../dist';

type Process = typeof cluster;
type Worker = typeof cluster.worker;

const cpus = os.cpus();
const numWorkers = cpus.length;

export class Primary {
  process: Process;
  primaryQueue: Queue;
  workerQueue: Queue;
  useLogging: boolean;
  cli: Cli;
  state: KeyPair = {};
  sends: QuickSends;

  constructor(
    process: Process,
    cli: Cli,
    onPrimaryMessage: (
      worker: Worker,
      command: Command
    ) => Promise<Command | void>,
    useLogging: boolean = false
  ) {
    this.cli = cli;
    this.process = process;
    this.useLogging = useLogging;
    this.primaryQueue = new Queue();
    this.workerQueue = new Queue();

    this.sends = {
      getNextJob: () => {
        return this.process.emit(
          internalCommands.getNextJob + '_primary',
          new Command(
            internalCommands.getNextJob + '_primary',
            {},
            'primary',
            'primary'
          )
        );
      },
      enqueueJob: (
        command: string,
        args: KeyPair,
        to: CommandTo = 'workers'
      ) => {
        return this.process.emit(
          internalCommands.enqueueJob,
          new Command(command, args, 'primary', to)
        );
      },
      newJobNotice: () => {
        // @TODO
        this.send(
          new Command(internalCommands.enqueueJob, {}, 'primary', 'workers')
        );
      },
      message: async (command: string, args: KeyPair) => {
        if (this.useLogging) {
          console.log('Primary Message:', command);
        }

        await onPrimaryMessage(
          null,
          new Command(command, args, 'primary', 'primary')
        );
      },
    };

    /**
     * Enqueue new command
     */
    process.on(internalCommands.enqueueJob, async (command: Command) => {
      if (command.to === 'primary') {
        // Primary should run its next command
        await command.run(this.state, this.sends);
      } else {
        // All workers should be told a new command has appeared
        this.addTask(command);
        this.sends.newJobNotice();
      }
    });

    /**
     * Primary requests next job
     */
    process.on(
      internalCommands.getNextJob + '_primary',
      async (worker: Worker) => {
        const nextCommand = this.primaryQueue.getNext(worker.process.pid);

        if (nextCommand === undefined) {
          return;
        }

        // @TODO might be bad
        const finalCommand = await onPrimaryMessage(worker, nextCommand);

        if (finalCommand) {
          worker.send(finalCommand);
        } else {
          worker.send(nextCommand);
        }
      }
    );

    /**
     * Worker requests next job
     */
    process.on(internalCommands.getNextJob, async (worker: Worker) => {
      const nextCommand = this.workerQueue.getNext(worker.process.pid);

      if (nextCommand === undefined) {
        return;
      }

      // @TODO might be bad
      const finalCommand = await onPrimaryMessage(worker, nextCommand);

      if (finalCommand) {
        worker.send(finalCommand);
      } else {
        worker.send(nextCommand);
      }
    });

    /**
     * Primary receives a general message from worker
     */
    process.on(
      internalCommands.message,
      async (worker: Worker, command: Command) => {
        if (this.useLogging) {
          console.log('Primary Message:', command);
        }
        await onPrimaryMessage(worker, command);
      }
    );

    /**
     * When a worker quits
     */
    process.on('exit', (worker, code, signal) => {
      if (this.useLogging) {
        console.info(`${worker.process.pid} died: ${code} ${signal}`);
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
  getWorkers() {
    return Object.values(cluster.workers);
  }

  /**
   * Send a message to workers
   */
  send(command: Command) {
    // @TODO
    const workers = this.getWorkers();

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
