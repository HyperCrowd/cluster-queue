import type { CommandAction, KeyPair, QuickSends } from './index.d';

import cluster from 'cluster';
import * as os from 'os';
import { Cli } from './cli';
import { Command } from './command';
import { Queue } from './queue';
import { internalCommands } from './commands';
import { getPrimaryEvents } from './primaryEvents';

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
  onMessage: CommandAction;

  constructor(
    process: Process,
    cli: Cli,
    onMessage: CommandAction,
    useLogging: boolean = false
  ) {
    this.cli = cli;
    this.process = process;
    this.useLogging = useLogging;
    this.primaryQueue = new Queue();
    this.workerQueue = new Queue();
    this.onMessage = onMessage;
    this.sends = getPrimaryEvents(this);

    /**
     * Primary receives a general message from worker
     */
    process.on(
      'message',
      async (worker: Worker | Command, possibleCommand: Command) => {
        const hasWorker = !(worker instanceof Command);
        const command = (hasWorker ? possibleCommand : worker) as Command;

        if (this.useLogging) {
          const label = hasWorker
            ? 'PID' + (worker as Worker).process.pid
            : (worker as Command).from;

          console.log(`[${label}]:`, command);
        }

        switch (command.to) {
          case internalCommands.enqueueJob:
            await this.enqueueJob(command);
            break;

          case internalCommands.getNextJob:
            await this.getNextJob(worker as Worker);
            break;

          case internalCommands.newJobNotice:
            this.newJobNotice();
            break;

          case internalCommands.message:
            await this.message(command);
            break;

          case internalCommands.enqueueJobPrimary:
            await this.enqueueJob(command);
            break;

          case internalCommands.getNextPrimaryJob:
            await this.getNextPrimaryJob();
            break;

          default:
            console.warn('Unknown command:', command);
            return;
        }
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

  /**
   * Enqueues a command.  If from primary, it will run the command instead
   */
  private async enqueueJob(command: Command) {
    if (command.to === internalCommands.enqueueJobPrimary) {
      // Primary should run its next command
      const newCommand = await this.onMessage(command, this.state, this.sends);

      if (newCommand === undefined) {
        await command.run(this.state, this.sends);
      } else {
        await (newCommand as Command).run(this.state, this.sends);
      }
    } else {
      // All workers should be told a new command has appeared
      this.addTask(command);
      this.sends.newJobNotice();
    }
  }

  /**
   * Gets the next job from the queue and sends it to a worker
   */
  private async getNextJob(worker: Worker) {
    const nextCommand = this.workerQueue.getNext(worker.process.pid);

    if (nextCommand === undefined) {
      return;
    }

    const finalCommand = await this.onMessage(
      nextCommand,
      this.state,
      this.sends
    );

    if (finalCommand) {
      worker.send(finalCommand);
    } else {
      worker.send(nextCommand);
    }
  }

  /**
   * Gets the next priamry job and runs it
   */
  private async getNextPrimaryJob() {
    const nextCommand = this.primaryQueue.getNext('primary');

    if (nextCommand === undefined) {
      return;
    }

    // @TODO might be bad
    const finalCommand = await this.onMessage(
      nextCommand,
      this.state,
      this.sends
    );

    if (finalCommand === undefined) {
      await nextCommand.run(this.state, this.sends);
    } else {
      await (finalCommand as Command).run(this.state, this.sends);
    }
  }

  /**
   * Generic message handler
   */
  private async message(command: Command) {
    if (this.useLogging) {
      console.log('Primary Message:', command);
    }

    await this.onMessage(command, this.state, this.sends);
  }

  /**
   * Sends a new job notice to valid workers
   */
  private newJobNotice() {
    // @TODO
  }
}
