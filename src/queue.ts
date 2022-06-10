import cluster from 'cluster';
import { Command } from './command';

export class Queue {
  queue: Command[] = [];

  shift(primary: typeof cluster, worker: typeof cluster.worker) {
    const command = this.queue.shift();
    if (command === undefined) {
      return;
    }

    // @TODO
  }
}
