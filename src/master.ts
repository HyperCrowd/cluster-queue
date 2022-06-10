import cluster from 'cluster';
import * as os from 'os';
import { Worker } from './worker';

const cpus = os.cpus();
const numWorkers = cpus.length;

type Process = typeof cluster;

export class Master {
  process: Process;
  workers: Worker[];

  /**
   *
   */
  constructor(process: Process, onMessage, onWorkerMessage) {
    this.process = process;
    this.workers = [];

    process.on('message', (worker, message) => {
      // @TODO
      onMessage(worker, message);
    });

    process.on('exit', (worker, code, signal) => {
      console.info(
        'Worker ' +
          worker.process.pid +
          ' died with code: ' +
          code +
          ', and signal: ' +
          signal
      );
      console.info('Starting a new worker...');
      this.spawnWorker();
    });

    process.on('online', (worker) => {
      console.info('Worker ' + worker.process.pid + ' is online');
      const newWorker = new Worker(worker, onWorkerMessage);
      this.workers.push(newWorker);
    });

    console.info('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
      this.spawnWorker();
    }
  }

  /**
   *
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
   *
   */
  getWorkerProcesses() {
    return Object.values(cluster.workers);
  }

  /**
   *
   */
  restartWorkers() {
    for (const worker of this.workers) {
      worker.restart();
    }
  }

  /**
   *
   */
  send(target, message) {
    const workers = this.getWorkerProcesses();

    for (const worker of workers) {
      if (
        target === 'all' ||
        (worker.process !== undefined && worker.process.pid === target)
      ) {
        console.info(`[MASTER -> PID ${worker.process.pid}]`, message);
        worker.process.send({
          from: 'master',
          message,
        });
      }
    }
  }
}
