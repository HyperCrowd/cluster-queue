import cluster from 'cluster';

type Process = typeof cluster.worker;

export class Worker {
  process: Process;

  /**
   *
   */
  constructor(worker, onMessage) {
    this.process = worker;

    this.process.on('message', (message) => {
      if (this.process.process !== undefined) {
        console.info(`[MASTER -> PID ${this.process.process.pid}]`, message);
        onMessage(message);
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
