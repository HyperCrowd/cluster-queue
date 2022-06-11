type Process = typeof cluster.worker;

import cluster from 'cluster';

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
  send(message) {
    console.info(`[PID ${this.process.process.pid} -> PRIMARY]`, message);
    this.process.process.send(message);
  }
}
