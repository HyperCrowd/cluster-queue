import type { KeyPair } from './index.d';
type Process = typeof cluster.worker;

import cluster from 'cluster';
import { Command } from './command';

export class Worker {
  process: Process;

  constructor(worker: Process, onMessage: (message: any) => Promise<void>) {
    this.process = worker;

    this.process.on('message', async (message) => {
      if (this.process.process !== undefined) {
        console.info(`[PRIMARY -> PID ${this.process.process.pid}]`, message);
        await onMessage(message);
      }
    });
  }

  /**
   * Restarts the worker
   */
  restart() {
    this.send({
      command: 'shutdown',
      from: this.process.process.pid,
    });

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
  workerCommand(command: string, args: KeyPair) {
    this.send(new Command(command, args, this.process.process.pid, 'workers'));
  }

  /**
   *
   */
  primaryCommand(command: string, args: KeyPair) {
    this.send(new Command(command, args, this.process.process.pid, 'primary'));
  }
}
