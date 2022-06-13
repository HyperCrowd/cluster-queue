import type { KeyPair } from './index.d';
type Process = typeof cluster.worker;

import cluster from 'cluster';
import { Command } from './command';

export class Worker {
  process: Process;

  constructor(worker: Process, onCommand: (command: Command) => Promise<void>) {
    this.process = worker;

    this.process.on('message', async (command: Command) => {
      console.log('worker.message');
      console.info(`[PRIMARY -> PID ${this.process.process.pid}]`, command);

      if (this.process.process !== undefined) {
        await onCommand(command);
      }
    });
  }

  /**
   * Restarts the worker
   */
  restart() {
    this.primaryCommand('shutdown');

    this.kill();
  }

  /**
   * Kills the worker
   */
  kill() {
    this.process.removeAllListeners();
    this.process.kill('SIGKILL');
    this.process = undefined;
  }

  /**
   * Sends a message from the worker to the primary
   */
  send(command: Command) {
    console.info(`[PID ${this.process.process.pid} -> PRIMARY]`, command);
    this.process.process.send(command);
  }

  /**
   *
   */
  getNext() {
    this.send(new Command('next', {}, this.process.process.pid, 'primary'));
  }

  /**
   *
   */
  workerCommand(command: string, args: KeyPair = {}) {
    this.send(new Command(command, args, this.process.process.pid, 'workers'));
  }

  /**
   *
   */
  primaryCommand(command: string, args: KeyPair = {}) {
    this.send(new Command(command, args, this.process.process.pid, 'primary'));
  }
}
