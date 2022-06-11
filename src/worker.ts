type Process = typeof cluster.worker;

import cluster from 'cluster';

export class Worker {
  process: Process;

  /**
   *
   */
  constructor(worker: Process, onMessage: (message: any) => Promise<void>) {
    this.process = worker;

    this.process.on('message', async (message) => {
      if (this.process.process !== undefined) {
        console.info(`[MASTER -> PID ${this.process.process.pid}]`, message);
        await onMessage(message);
      }
    });
  }

  /**
   *
   */
  restart() {
    this.send({
      command: 'shutdown',
      from: this.process.process.pid,
    });

    this.kill();
  }

  /**
   *
   */
  kill() {
    this.process.removeAllListeners();
    this.process.kill('SIGKILL');
    this.process = undefined;
  }

  /**
   *
   */
  send(message) {
    console.info(`[PID ${this.process.process.pid} -> MASTER]`, message);
    this.process.process.send(message);
  }
}
